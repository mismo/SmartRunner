package smart;

import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.mozilla.javascript.*;

public class SpecRunner {

	private static final String PROJECT_NAME = "SmartRunner";

	private static String rootPath;

	/**
	 * Start execute a set of JavaScript source files.
	 * 
	 * @param filenames
	 *            filename is relative "/SmartRunner/src/web/".
	 * @throws IOException
	 */
	public void start(String[] filenames) throws IOException {
		if (filenames == null) {
			return;
		}
		List<String> files = new ArrayList<String>();
		files.add("lib/jasmine/jasmine.js");
		files.add("lib/jasmine/jasmine_junit_reporter.js");
		for (String filename : filenames) {
			files.add(filename.replaceAll("\\\\", "/"));
		}
		files.add("lib/jasmine/go.js");
		Context context = ContextFactory.getGlobal().enterContext();
		try {
			Scriptable scope = createStandardScope(context);
			scope = createEnvScope(context, scope);
			for (String file : files) {
				String name = getFullName(file);
				processSource(context, scope, name);
			}
		} finally {
			Context.exit();
		}
	}

	/**
	 * Evaluate JavaScript source.
	 */
	private static Object processSource(Context context, Scriptable scope, String filename)
			throws IOException {
		FileReader in = null;
		try {
			in = new FileReader(filename);
			Object result = context.evaluateReader(scope, in, filename, 1, null);
			return result;
		} finally {
			try {
				if (in != null) {
					in.close();
				}
			} catch (IOException ioe) {
				System.err.println(ioe.toString());
			}
		}
	}

	private Scriptable createStandardScope(Context context) throws IOException {
		context.setOptimizationLevel(-1); // Fix: generated bytecode for method exceeds 64K limit
		ScriptableObject standardScope = context.initStandardObjects();
		String[] names = { "print", "load" };
		standardScope.defineFunctionProperties(names, SpecRunner.class, ScriptableObject.DONTENUM);
		String[] filenames = new String[] { "lib/env/env_rhino.js", "lib/env/timer.js" };
		for (String name : filenames) {
			String filename = getFullName(name);
			processSource(context, standardScope, filename);
		}
		return standardScope;
	}

	private Scriptable createEnvScope(Context context, Scriptable parentScope) throws IOException {
		Scriptable scope = new NativeObject();
		scope.setParentScope(parentScope);
		return scope;
	}

	/**
	 * This method is defined as a JavaScript function.
	 */
	public static void print(Context context, Scriptable thisObj, Object[] args, Function funObj) {
		for (int i = 0; i < args.length; i++) {
			if (i > 0)
				System.out.print(" ");
			String s = Context.toString(args[i]);
			System.out.print(s);
		}
		System.out.println();
	}

	/**
	 * Load and execute a set of JavaScript source files.
	 * 
	 * This method is defined as a JavaScript function.
	 */
	public static void load(Context context, Scriptable thisObj, Object[] args, Function funObj)
			throws IOException {
		for (int i = 0; i < args.length; i++) {
			processSource(context, thisObj, getFullName(Context.toString(args[i])));
		}
	}

	private static String getRootPath() {
		if (rootPath == null) {
			String path = SpecRunner.class.getResource("").getPath().replaceFirst("file:", "");
			String key = "/" + PROJECT_NAME + "/";
			rootPath = path.substring(0, path.lastIndexOf(key)) + key;
		}
		return rootPath;
	}

	private static String getFullName(String filename) {
		if (filename == null) {
			return null;
		}
		if (filename.indexOf(':') > 0) {
			return filename;
		} else {
			return getRootPath() + "src/web/" + filename;
		}
	}

	/**
	 * Main entry point
	 * 
	 * @param args
	 * @throws IOException
	 */
	public static void main(String[] args) throws IOException {
		SpecRunner runner = new SpecRunner();
		if (args == null || args.length == 0) { // internal test
			String[] filenames = new String[] { "js/Song.js", //
					"js/Player.js", //
					"spec/SpecHelper.js", //
					"spec/PlayerSpec.js" //
			};
			// filenames = new String[] { "lib/env/test_env.js" };
			runner.start(filenames);
		} else { // run with ANT build or command line
			runner.start(args);
		}
	}

}
