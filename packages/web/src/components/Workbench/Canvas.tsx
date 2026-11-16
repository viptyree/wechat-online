import { activatedNodeAtom, hoveredNodeAtom } from "@/stateV2/detectedNode";
import {
	MOBILE_LIST,
	clampDimension,
	customScreenAtom,
	deviceAtom,
	lockAspectAtom,
	previewZoomAtom,
} from "@/stateV2/device";
import { useSize } from "ahooks";
import { useAtomValue, useSetAtom } from "jotai";
import { type PointerEvent, useRef, useState } from "react";
import Screen from "../Screen";
import useDeviceConfig from "../useDeviceConfig";

const Canvas = () => {
	const viewport = useRef<HTMLDivElement>(null);
	const available = useSize(viewport);
	const { screenSize } = useDeviceConfig();
	const clearSelection = useSetAtom(activatedNodeAtom);
	const clearHover = useSetAtom(hoveredNodeAtom);
	const zoom = useAtomValue(previewZoomAtom);
	const locked = useAtomValue(lockAspectAtom);
	const setCustom = useSetAtom(customScreenAtom);
	const setDevice = useSetAtom(deviceAtom);
	const [dragScale, setDragScale] = useState<number | null>(null);
	const drag = useRef<{
		x: number;
		y: number;
		width: number;
		height: number;
		scale: number;
		locked: boolean;
	} | null>(null);
	const fit = Math.min(
		1,
		Math.max(0.05, ((available?.width ?? 500) - 80) / screenSize.width),
		Math.max(0.05, ((available?.height ?? 950) - 80) / screenSize.height),
	);
	const scale = dragScale ?? (zoom === "fit" ? fit : zoom);
	const stopResize = () => {
		drag.current = null;
		setDragScale(null);
	};
	const resize = (event: PointerEvent<HTMLButtonElement>) => {
		const start = drag.current;
		if (!start) return;
		let width = start.width + (event.clientX - start.x) / start.scale;
		let height = start.height + (event.clientY - start.y) / start.scale;
		if (start.locked) {
			const horizontalDelta = width / start.width - 1;
			const verticalDelta = height / start.height - 1;
			const factor =
				1 + (Math.abs(horizontalDelta) > Math.abs(verticalDelta) ? horizontalDelta : verticalDelta);
			const bounded = Math.min(
				800 / start.width,
				1600 / start.height,
				Math.max(280 / start.width, 480 / start.height, factor),
			);
			width = start.width * bounded;
			height = start.height * bounded;
		}
		setCustom({ width: clampDimension(width, "width"), height: clampDimension(height, "height") });
		setDevice(MOBILE_LIST.CUSTOM);
	};
	return (
		<div className="canvas-viewport" id="center" ref={viewport}>
			<div
				className="canvas-space"
				onClick={(event) => {
					if (event.target === event.currentTarget) {
						clearSelection(null);
						clearHover(null);
					}
				}}
				style={{
					minWidth: screenSize.width * scale + 80,
					minHeight: screenSize.height * scale + 80,
				}}
			>
				<div
					className="canvas-frame"
					style={{ width: screenSize.width * scale, height: screenSize.height * scale }}
				>
					<div
						className="canvas-transform"
						style={{
							width: screenSize.width,
							height: screenSize.height,
							transform: `scale(${scale})`,
						}}
					>
						<Screen />
					</div>
					<button
						type="button"
						className="canvas-resize"
						aria-label="拖动调整画面大小"
						title="拖动调整画面大小"
						onPointerDown={(event) => {
							if (event.button !== 0) return;
							event.currentTarget.setPointerCapture(event.pointerId);
							setDragScale(scale);
							drag.current = { x: event.clientX, y: event.clientY, ...screenSize, scale, locked };
						}}
						onPointerMove={resize}
						onPointerUp={stopResize}
						onPointerCancel={stopResize}
						onLostPointerCapture={stopResize}
					>
						⌟
					</button>
				</div>
			</div>
			<div className="canvas-caption">
				{screenSize.width} × {screenSize.height} <span>·</span> {Math.round(scale * 100)}%
			</div>
		</div>
	);
};
export default Canvas;
