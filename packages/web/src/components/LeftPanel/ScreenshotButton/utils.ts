import { BrowserTypes } from "react-device-detect";

export function checkCanDirectCreateScreenshot({
	browserName,
	browserVersion,
}: { browserName: string; browserVersion: string }) {
	const majorVersion = Number.parseInt(browserVersion ?? "", 10);
	let errorText: string | undefined;

	switch (browserName) {
		case BrowserTypes.EdgeChromium:
		case BrowserTypes.Edge:
			if (majorVersion < 94) {
				errorText = "请升级到新版本的 Edge 浏览器";
			}
			break;
		case BrowserTypes.Chromium:
		case BrowserTypes.Chrome:
			if (majorVersion < 104) {
				errorText = "请升级到 Chrome > 104 或更高版本";
			}
			break;
		case BrowserTypes.Opera:
			if (majorVersion < 90) {
				errorText = "请升级到 Opera > 90 或更高版本";
			}
			break;
		default:
			errorText = "您的浏览器不支持直接创建截图，请使用新版的 Edge、Chrome 或 Opera 浏览器";
	}
	if (errorText) throw new Error(errorText);
}

type CropRect = {
	x: number;
	y: number;
	width: number;
	height: number;
};

/** 等到第一帧真正画面被解码出来，避免抓到空白/黑帧 */
function waitFirstFrame(video: HTMLVideoElement) {
	return new Promise<void>((resolve) => {
		let settled = false;
		const done = () => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			resolve();
		};
		const timer = setTimeout(done, 2000);
		if (typeof video.requestVideoFrameCallback === "function") {
			video.requestVideoFrameCallback(done);
		} else {
			video.addEventListener("loadeddata", done, { once: true });
		}
		video.play().catch(done);
	});
}

/**
 * 把共享的视频流绘制到 canvas 上。
 *
 * 这里不再使用 Region Capture 的 cropTo：Chromium 在裁剪时会按视频编码要求
 * 对齐裁剪区域，右/下边缘容易留下 1~2px 没被填充的黑色像素。
 * 改为在 canvas 上按元素矩形精确裁切，输出尺寸与元素一致且不会出现黑边。
 */
export async function drawToCanvas(stream: MediaStream, crop?: CropRect) {
	const video = document.createElement("video");
	video.muted = true;
	video.playsInline = true;
	video.srcObject = stream;

	await waitFirstFrame(video);

	const vw = video.videoWidth;
	const vh = video.videoHeight;
	if (!vw || !vh) throw new Error("没有拿到画面，请重试");

	// 视频分辨率 / 页面 CSS 尺寸 = 当前屏幕的缩放比例
	const scale = vw / window.innerWidth;
	// 分享的是整个屏幕或别的窗口时，比例对不上，裁出来会错位
	if (Math.abs(vh / window.innerHeight - scale) > 0.05) {
		throw new Error("请选择「当前标签页」进行分享，否则截图区域会错位");
	}

	const sx = clamp(Math.round((crop?.x ?? 0) * scale), 0, vw);
	const sy = clamp(Math.round((crop?.y ?? 0) * scale), 0, vh);
	const width = Math.min(vw - sx, Math.round((crop?.width ?? window.innerWidth) * scale));
	const height = Math.min(vh - sy, Math.round((crop?.height ?? window.innerHeight) * scale));

	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;

	const ctx = canvas.getContext("2d")!;
	ctx.imageSmoothingQuality = "high";
	// 只取需要的区域，直接画成目标尺寸，边界不会带上多余像素
	ctx.drawImage(video, sx, sy, width, height, 0, 0, width, height);

	return canvas;
}

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}
