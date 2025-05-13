import Bun from "bun";

const timetaken = "complete build";

// Starts the timer, the label value is timetaken
console.time(timetaken);

Bun.build({
	entrypoints: ["./src/index.ts"],
	outdir: "./dist",
	format: "esm",
	minify: true,
	sourcemap: "linked",
	target: "bun", // Establece el objetivo a "node"
	// Puedes añadir más opciones aquí según tus necesidades
})
	.then(() => {
		console.log("Build completed successfully");
	})
	.catch((err) => {
		console.error("Build failed:", err);
	})
	.finally(() => {
		console.timeEnd(timetaken);
	});
