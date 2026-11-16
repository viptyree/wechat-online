import {
	DEFAULT_SCREEN_SIZE,
	MOBILE_LIST,
	SCREEN_SIZE,
	appearanceAtom,
	clampDimension,
	customScreenAtom,
	deviceAtom,
} from "@/stateV2/device";
import { useAtomValue } from "jotai";

export default function useDeviceConfig() {
	const device = useAtomValue(deviceAtom);
	const custom = useAtomValue(customScreenAtom);
	const appearance = useAtomValue(appearanceAtom);
	const preset =
		device === MOBILE_LIST.CUSTOM ? custom : SCREEN_SIZE[device as keyof typeof SCREEN_SIZE];
	const screenSize = {
		width: clampDimension(preset?.width || DEFAULT_SCREEN_SIZE.width, "width"),
		height: clampDimension(preset?.height || DEFAULT_SCREEN_SIZE.height, "height"),
	};
	const isAndroid =
		appearance === "android" || (appearance === "auto" && !device.startsWith("iPhone"));
	return { screenSize, device, isAndroid };
}
