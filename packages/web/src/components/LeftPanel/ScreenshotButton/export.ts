import { toSvg } from "html-to-image";

/** Embed resources, then freeze scroll viewports in the detached SVG snapshot. */
export async function exportScreen(screen: HTMLElement, pixelRatio: number) {
	await document.fonts.ready;
	await Promise.all(
		Array.from(screen.querySelectorAll("img")).map(async (image) => {
			try {
				await image.decode();
			} catch {
				throw new Error("有图片尚未加载或无法访问，请更换图片后重试");
			}
		}),
	);
	const width = screen.offsetWidth;
	const height = screen.offsetHeight;
	const scale = screen.getBoundingClientRect().width / width;
	const scrollports = Array.from(screen.querySelectorAll<HTMLElement>("*")).filter((element) => {
		const style = getComputedStyle(element);
		return (
			/(auto|scroll)/.test(`${style.overflowX} ${style.overflowY}`) &&
			(element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth)
		);
	});
	const snapshots = scrollports.map((element, index) => {
		const rect = element.getBoundingClientRect();
		const marker = element.getAttribute("data-export-scroll");
		element.setAttribute("data-export-scroll", String(index));
		return {
			element,
			marker,
			children: Array.from(element.children).map((child) => {
				const bounds = child.getBoundingClientRect();
				return {
					left: (bounds.left - rect.left) / scale - element.clientLeft,
					top: (bounds.top - rect.top) / scale - element.clientTop,
					width: bounds.width / scale,
					height: bounds.height / scale,
				};
			}),
		};
	});
	let svg: string;
	try {
		svg = await toSvg(screen, {
			width,
			height,
			backgroundColor: "#f5f5f5",
			includeQueryParams: true,
			style: { transform: "none", margin: "0" },
			onImageErrorHandler: () => {
				throw new Error("图片无法导出，请使用本地上传的图片后重试");
			},
		});
	} finally {
		for (const { element, marker } of snapshots) {
			if (marker === null) element.removeAttribute("data-export-scroll");
			else element.setAttribute("data-export-scroll", marker);
		}
	}
	const documentCopy = new DOMParser().parseFromString(
		decodeURIComponent(svg.slice(svg.indexOf(",") + 1)),
		"image/svg+xml",
	);
	for (let index = 0; index < snapshots.length; index++) {
		const clone = documentCopy.querySelector<HTMLElement>(`[data-export-scroll="${index}"]`);
		if (!clone) continue;
		clone.style.position = "relative";
		clone.style.overflow = "hidden";
		clone.removeAttribute("data-export-scroll");
		snapshots[index].children.forEach((bounds, childIndex) => {
			const child = clone.children[childIndex] as HTMLElement | undefined;
			if (!child?.style) return;
			Object.assign(child.style, {
				position: "absolute",
				margin: "0",
				left: `${bounds.left}px`,
				top: `${bounds.top}px`,
				right: "auto",
				bottom: "auto",
				width: `${bounds.width}px`,
				height: `${bounds.height}px`,
				boxSizing: "border-box",
				transform: "none",
			});
		});
	}
	const image = new Image();
	image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(documentCopy))}`;
	await image.decode();
	const canvas = document.createElement("canvas");
	canvas.width = width * pixelRatio;
	canvas.height = height * pixelRatio;
	const context = canvas.getContext("2d");
	if (!context) throw new Error("浏览器无法创建图片画布");
	context.drawImage(image, 0, 0, canvas.width, canvas.height);
	return new Promise<Blob>((resolve, reject) =>
		canvas.toBlob(
			(blob) => (blob ? resolve(blob) : reject(new Error("PNG 生成失败，请重试"))),
			"image/png",
		),
	);
}
