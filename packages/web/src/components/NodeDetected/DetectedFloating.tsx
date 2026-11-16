import TopOperations from "@/components/TopOperations";
import { activatedNodeAtom, hoveredNodeAtom } from "@/stateV2/detectedNode";
import {
	FloatingOverlay,
	FloatingPortal,
	type Middleware,
	autoUpdate,
	detectOverflow,
	offset,
	size,
	useFloating,
} from "@floating-ui/react";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { twJoin } from "tailwind-merge";
import useMode from "../useMode";

type ActivatedBorderProps = {
	element: Element;
	type: "hover" | "activated";
	nodeId: string;
};

const screenOverflow: Middleware = {
	name: "screenOverflow",
	fn: async (state) => {
		const boundary = document.getElementById("screen")!;
		const overflow = await detectOverflow(state, {
			boundary,
			elementContext: "reference",
		});
		const { top, bottom } = overflow;
		const topClipped = top >= 0;
		const bottomClipped = bottom >= 0;
		const allClipped = topClipped && bottomClipped;
		const unClipped = !topClipped && !bottomClipped;

		return {
			data: {
				overflow,
				topClipped,
				bottomClipped,
				allClipped,
				unClipped,
				offsetTop: boundary.offsetTop,
				screenHeight: boundary.clientHeight,
				completelyHidden: bottom > boundary.offsetTop,
			},
		};
	},
};

const DetectedOverlay = ({ element, type, nodeId }: ActivatedBorderProps) => {
	const { floatingStyles, refs } = useFloating({
		elements: {
			reference: element,
		},
		placement: "bottom-start",
		middleware: [
			offset(({ rects }) => -rects.reference.height),
			screenOverflow,
			size({
				apply: ({ elements, middlewareData, rects }) => {
					const { overflow } = middlewareData.screenOverflow;
					const clipTop = overflow.top;
					const clipBottom = overflow.bottom;
					const needClip = clipTop > 0 || clipBottom > 0;
					Object.assign(elements.floating.style, {
						width: `${rects.reference.width}px`,
						height: `${rects.reference.height}px`,
						clipPath: needClip
							? `inset(${clipTop > 0 ? clipTop : -28}px 0 ${clipBottom}px 0)`
							: "unset",
					});
				},
			}),
		],
		whileElementsMounted: (reference, floating, update) =>
			autoUpdate(reference, floating, update, { animationFrame: true }),
	});

	const operaionsElement = useMemo(() => {
		return <TopOperations nodeId={nodeId} />;
	}, [nodeId]);

	return (
		<FloatingPortal>
			<FloatingOverlay
				className={twJoin(
					"!overflow-hidden pointer-events-none h-screen w-screen",
					type === "activated" && "z-200",
					type === "hover" && "z-40",
				)}
			>
				<div
					ref={refs.setFloating}
					className={twJoin(
						"-outline-offset-2 outline outline-2",
						type === "activated" && "outline-antDaybreakBlue-6",
						type === "hover" && "outline-dashed outline-antDaybreakBlue-3",
					)}
					style={{
						...floatingStyles,
					}}
				>
					{type === "activated" && operaionsElement}
				</div>
			</FloatingOverlay>
		</FloatingPortal>
	);
};

const DetectedOverall = () => {
	const { isPreview } = useMode();
	const activatedNode = useAtomValue(activatedNodeAtom);
	const hoveredNode = useAtomValue(hoveredNodeAtom);

	const activatedBorder = useMemo(() => {
		if (activatedNode) {
			const element = document.getElementById(activatedNode);
			if (!element) return null;
			return <DetectedOverlay type="activated" element={element} nodeId={activatedNode} />;
		}
	}, [activatedNode]);

	const hoverdBorder = useMemo(() => {
		if (hoveredNode && hoveredNode !== activatedNode) {
			const element = document.getElementById(hoveredNode);
			if (!element) return null;
			return <DetectedOverlay type="hover" element={element} nodeId={hoveredNode} />;
		}
	}, [hoveredNode]);

	if (isPreview) return null;

	return (
		<>
			{activatedBorder}
			{hoverdBorder}
		</>
	);
};

export default DetectedOverall;
