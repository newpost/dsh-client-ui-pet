// Hand-written DSH client plugin bundle.
// Contract (mirrors @deepseek-ai/dsh-client-ui-plan/lib/client.js exactly):
//   window.__ModuleLoader__.load({ id, factory })
//   factory(require) returns module.exports = { apply(ctx), inject: [services] }
//   apply(ctx) -> ctx.slots.inject(slotName, () => ctx.slots.register({...}, Component))
window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-pet",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");

		// Inject one global stylesheet for the pet (runs once at materialization).
		const PET_CSS_TAG = "@deepseek-ai/dsh-client-ui-pet/style";
		const css = `
.dsh-pet-root{position:fixed;right:18px;bottom:18px;z-index:99999;filter:drop-shadow(0 6px 12px rgba(0,0,0,.25));user-select:none;-webkit-user-select:none;font-family:system-ui,sans-serif;pointer-events:auto}
.dsh-pet-body{width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:44px;line-height:1;
  background:linear-gradient(160deg,#ffd6a5,#ff9a76);border:2px solid rgba(0,0,0,.08);cursor:grab;
  animation:dsh-pet-bob 2.6s ease-in-out infinite;transition:transform .12s ease}
.dsh-pet-body:active{cursor:grabbing}
.dsh-pet-root.is-dragging .dsh-pet-body{animation:none;transition:none}
.dsh-pet-root.is-dragging{filter:drop-shadow(0 10px 18px rgba(0,0,0,.28))}
@keyframes dsh-pet-bob{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-8px) rotate(3deg)}}
.dsh-pet-bubble{position:absolute;bottom:100%;right:0;margin-bottom:10px;padding:6px 10px;background:#fff;color:#333;border-radius:12px 12px 2px 12px;
  font-size:12px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.12);opacity:0;transform:translateY(4px);transition:opacity .18s ease,transform .18s ease;pointer-events:none}
.dsh-pet-root.show-bubble .dsh-pet-bubble{opacity:1;transform:translateY(0)}
`;
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(PET_CSS_TAG) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-pet";
			tag.dataset.pluginCss = PET_CSS_TAG;
			tag.textContent = css;
			document.head.appendChild(tag);
		}

		// A small animated, draggable pet that floats in the bottom-right corner.
		function Pet() {
			const petRef = react.useRef(null);
			const dragging = react.useRef(false);
			const offset = react.useRef({ x: 0, y: 0 });
			const [isDragging, setDragging] = react.useState(false);
			const [speech, setSpeech] = react.useState("你好呀！");

			// Greet once shortly after mount.
			react.useEffect(() => {
				const handle = window.setTimeout(() => {
					setSpeech("你好呀！我是桌宠 ~");
					const root = petRef.current;
					if (root) {
						root.classList.add("show-bubble");
						window.setTimeout(() => root.classList.remove("show-bubble"), 2600);
					}
				}, 1200);
				return () => window.clearTimeout(handle);
			}, []);

			const onPointerDown = (e) => {
				if (e.button !== 0) return;
				dragging.current = true;
				const rect = petRef.current.getBoundingClientRect();
				offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
				setDragging(true);
				e.preventDefault();
			};

			react.useEffect(() => {
				const move = (e) => {
					if (!dragging.current) return;
					const root = petRef.current;
					if (!root) return;
					root.style.left = String(Math.max(0, e.clientX - offset.current.x)) + "px";
					root.style.top = String(Math.max(0, e.clientY - offset.current.y)) + "px";
					root.style.right = "auto";
					root.style.bottom = "auto";
				};
				const up = () => {
					dragging.current = false;
					setDragging(false);
				};
				window.addEventListener("pointermove", move);
				window.addEventListener("pointerup", up);
				return () => {
					window.removeEventListener("pointermove", move);
					window.removeEventListener("pointerup", up);
				};
			}, []);

			return react.createElement("div", {
				ref: petRef,
				className: "dsh-pet-root" + (isDragging ? " is-dragging" : "")
			}, [
				react.createElement("div", { className: "dsh-pet-bubble" }, speech),
				react.createElement("div", {
					className: "dsh-pet-body",
					onPointerDown,
					title: "拖动我，我是一只桌宠"
				}, "🐱")
			]);
		}

		// Services required by apply().
		const inject = ["slots"];

		// Client plugin body: register the pet into the frame-wide overlay.
		function apply(ctx) {
			// "shell.overlay" is the frame-wide overlay layer (scope root)
			// declared and rendered by ui-layout's AppFrame; it is a list slot
			// so entries are additive and it renders even in the empty/hero
			// state. The layer has pointer-events:none; the pet re-enables them
			// in its own CSS. The component floats itself to the viewport
			// bottom-right corner with position:fixed.
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "pet",
				order: 10
			}, Pet));
		}

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
