window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-brand-official",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region lib/types/client/Brand.js
		/**
		* Render the official mark with the presentation requested by its host surface.
		* @param props - Host-supplied mark presentation.
		* @returns the official whale mark.
		*/
		function OfficialBrandMark({ size, className }) {
			const px = typeof size === "number" ? size : 24;
			return (0, react_jsx_runtime.jsx)("img", {
				src: "/brand/aibizhive-icon.png",
				alt: "AI Bizhive Harness",
				width: px,
				height: px,
				className,
				style: {
					display: "block",
					objectFit: "contain"
				}
			});
		}
		/**
		* Render the brand name wordmark without its independently slotted mark.
		* @returns the AIBizhive Harness name wordmark.
		*/
		function OfficialBrandName() {
			return (0, react_jsx_runtime.jsx)("span", {
				style: {
					display: "inline-flex",
					alignItems: "baseline",
					gap: "0.45em",
					whiteSpace: "nowrap",
					overflow: "hidden",
					textOverflow: "ellipsis",
					maxWidth: "100%",
					fontFamily: "var(--sg-display, var(--dsw-font-family))",
					color: "var(--dsw-alias-label-primary)"
				},
				children: [(0, react_jsx_runtime.jsx)("span", {
					style: {
						fontWeight: 700,
						letterSpacing: ".10em",
						textTransform: "uppercase"
					},
					children: "AI Bizhive"
				}, "aib"), (0, react_jsx_runtime.jsx)("span", {
					style: {
						fontWeight: 600,
						fontSize: "0.78em",
						letterSpacing: ".14em",
						textTransform: "uppercase",
						color: "var(--dsw-alias-label-secondary)"
					},
					children: "Harness"
				}, "har")]
			});
		}
		//#endregion
		//#region lib/types/client/index.js
		/** Required service: the UI slot registry. */
		const inject = ["slots"];
		/**
		* Fill every shipped brand slot as one declaration-aware registration set.
		* @param ctx - Client root context.
		*/
		function apply(ctx) {
			ctx.slots.inject("sidebar.brand.mark", () => ctx.slots.inject("sidebar.brand.name", () => ctx.slots.inject("conversation.hero.brand.mark", function* () {
				yield ctx.slots.register({ name: "sidebar.brand.mark" }, OfficialBrandMark);
				yield ctx.slots.register({ name: "sidebar.brand.name" }, OfficialBrandName);
				yield ctx.slots.register({ name: "conversation.hero.brand.mark" }, OfficialBrandMark);
			})));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map