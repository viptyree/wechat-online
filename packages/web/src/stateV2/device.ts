import atomWithStorage from "./atomWithStorage";
import { mainStore } from "./store";

export enum MOBILE_LIST {
	AUTO = "auto",
	CUSTOM = "custom",
	ANDROID_COMPACT = "android-compact",
	ANDROID_STANDARD = "android-standard",
	ANDROID_LARGE = "android-large",
	ANDROID_WIDE = "android-wide",
	IPHONE_12_PRO = "iPhone 12 Pro",
	IPHONE_14_PRO_MAX = "iPhone 14 Pro Max",
	IPHONE_XR = "iPhone XR",
	IPHONE_SE = "iPhone SE",
	PIXEL = "Pixel",
}

export const MOBILE_LIST_LABEL = {
	[MOBILE_LIST.AUTO]: "自动（安卓标准比例）",
	[MOBILE_LIST.CUSTOM]: "自定义尺寸",
	[MOBILE_LIST.ANDROID_COMPACT]: "安卓 · 紧凑 360 × 800",
	[MOBILE_LIST.ANDROID_STANDARD]: "安卓 · 标准 393 × 873",
	[MOBILE_LIST.ANDROID_LARGE]: "安卓 · 大屏 412 × 915",
	[MOBILE_LIST.ANDROID_WIDE]: "安卓 · 加宽 432 × 960",
	[MOBILE_LIST.IPHONE_14_PRO_MAX]: "iPhone 14 Pro Max",
	[MOBILE_LIST.IPHONE_12_PRO]: "iPhone 12 Pro",
	[MOBILE_LIST.IPHONE_XR]: "iPhone XR",
	[MOBILE_LIST.IPHONE_SE]: "iPhone SE",
	[MOBILE_LIST.PIXEL]: "Pixel",
};

export const SCREEN_SIZE = {
	[MOBILE_LIST.ANDROID_COMPACT]: { width: 360, height: 800 },
	[MOBILE_LIST.ANDROID_STANDARD]: { width: 393, height: 873 },
	[MOBILE_LIST.ANDROID_LARGE]: { width: 412, height: 915 },
	[MOBILE_LIST.ANDROID_WIDE]: { width: 432, height: 960 },
	[MOBILE_LIST.IPHONE_14_PRO_MAX]: {
		width: 430,
		height: 932,
	},
	[MOBILE_LIST.IPHONE_12_PRO]: {
		width: 390,
		height: 844,
	},
	[MOBILE_LIST.IPHONE_XR]: {
		width: 414,
		height: 896,
	},
	[MOBILE_LIST.IPHONE_SE]: {
		width: 375,
		height: 667,
	},
	[MOBILE_LIST.PIXEL]: {
		width: 412,
		height: 915,
	},
};

export const deviceAtom = atomWithStorage<MOBILE_LIST>("device", MOBILE_LIST.ANDROID_STANDARD);

export type ScreenSize = { width: number; height: number };
export const DEFAULT_SCREEN_SIZE: ScreenSize = { width: 393, height: 873 };
export const clampDimension = (value: number, axis: keyof ScreenSize) =>
	Math.round(
		Math.min(axis === "width" ? 800 : 1600, Math.max(axis === "width" ? 280 : 480, value)),
	);
export const customScreenAtom = atomWithStorage<ScreenSize>("customScreen", DEFAULT_SCREEN_SIZE);
export const lockAspectAtom = atomWithStorage("lockScreenAspect", true);
export const previewZoomAtom = atomWithStorage<number | "fit">("previewZoom", "fit");
export const exportScaleAtom = atomWithStorage("exportScale", 3);
export const appearanceAtom = atomWithStorage<"auto" | "android" | "ios">(
	"screenAppearance",
	"auto",
);
export const navigationAtom = atomWithStorage<"gesture" | "buttons" | "hidden">(
	"androidNavigation",
	"gesture",
);

window.setDevice = (v) => {
	if (Object.values(MOBILE_LIST).includes(v as MOBILE_LIST))
		mainStore.set(deviceAtom, v as MOBILE_LIST);
};
