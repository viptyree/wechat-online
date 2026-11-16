import {
	DEFAULT_SCREEN_SIZE,
	MOBILE_LIST,
	appearanceAtom,
	clampDimension,
	customScreenAtom,
	deviceAtom,
	exportScaleAtom,
	lockAspectAtom,
	navigationAtom,
	previewZoomAtom,
} from "@/stateV2/device";
import { Button, InputNumber, Select, Switch } from "antd";
import { useAtom, useSetAtom } from "jotai";
import ScreenDevicesSelect from "../LeftPanel/ScreenDevicesSelect";
import useDeviceConfig from "../useDeviceConfig";

export const SizeInputs = () => {
	const { screenSize } = useDeviceConfig();
	const setDevice = useSetAtom(deviceAtom);
	const setCustom = useSetAtom(customScreenAtom);
	const [locked, setLocked] = useAtom(lockAspectAtom);
	const update = (axis: "width" | "height", value: number | null) => {
		if (value === null || !Number.isFinite(value)) return;
		const next = { ...screenSize, [axis]: clampDimension(value, axis) };
		if (locked) {
			const other = axis === "width" ? "height" : "width";
			next[other] = clampDimension((next[axis] * screenSize[other]) / screenSize[axis], other);
			next[axis] = clampDimension((next[other] * screenSize[axis]) / screenSize[other], axis);
		}
		setCustom(next);
		setDevice(MOBILE_LIST.CUSTOM);
	};
	return (
		<div className="size-inputs">
			<InputNumber
				aria-label="画面宽度"
				addonBefore="宽"
				min={280}
				max={800}
				precision={0}
				value={screenSize.width}
				onChange={(v) => update("width", v)}
			/>
			<span className="size-times">×</span>
			<InputNumber
				aria-label="画面高度"
				addonBefore="高"
				min={480}
				max={1600}
				precision={0}
				value={screenSize.height}
				onChange={(v) => update("height", v)}
			/>
			<Switch
				aria-label="锁定宽高比例"
				checked={locked}
				onChange={setLocked}
				checkedChildren="锁定"
				unCheckedChildren="自由"
			/>
		</div>
	);
};

export const ZoomSelect = () => {
	const [zoom, setZoom] = useAtom(previewZoomAtom);
	return (
		<Select
			aria-label="预览缩放"
			value={zoom}
			onChange={setZoom}
			options={[
				{ value: "fit", label: "适应窗口" },
				...[0.5, 0.75, 1, 1.25, 1.5].map((value) => ({ value, label: `${value * 100}%` })),
			]}
			style={{ width: 112 }}
		/>
	);
};

const ScreenSettings = () => {
	const [appearance, setAppearance] = useAtom(appearanceAtom);
	const [navigation, setNavigation] = useAtom(navigationAtom);
	const [scale, setScale] = useAtom(exportScaleAtom);
	const setCustom = useSetAtom(customScreenAtom);
	const setDevice = useSetAtom(deviceAtom);
	const { screenSize } = useDeviceConfig();
	return (
		<div className="screen-settings">
			<div className="settings-intro">
				<span className="eyebrow">CANVAS</span>
				<h2>画面设置</h2>
				<p>选择屏幕比例，或输入你需要的尺寸。</p>
			</div>
			<div className="setting-label">设备预设</div>
			<ScreenDevicesSelect />
			<div className="setting-label">画面尺寸</div>
			<SizeInputs />
			<p className="setting-help">布局尺寸，单位 px。拖动画布右下角也可调整。</p>
			<div className="setting-label">系统外观</div>
			<Select
				aria-label="系统外观"
				value={appearance}
				onChange={setAppearance}
				options={[
					{ value: "auto", label: "跟随设备" },
					{ value: "android", label: "Android" },
					{ value: "ios", label: "iOS" },
				]}
			/>
			<div className="setting-label">安卓底部导航</div>
			<Select
				aria-label="安卓底部导航"
				value={navigation}
				onChange={setNavigation}
				options={[
					{ value: "gesture", label: "手势条" },
					{ value: "buttons", label: "三键导航" },
					{ value: "hidden", label: "隐藏" },
				]}
			/>
			<div className="setting-label">PNG 导出倍率</div>
			<Select
				aria-label="导出倍率"
				value={scale}
				onChange={setScale}
				options={[1, 2, 3].map((value) => ({
					value,
					label: `${value} 倍 · ${screenSize.width * value} × ${screenSize.height * value}`,
				}))}
			/>
			<p className="setting-help">预览缩放不改变排版和导出尺寸。安卓预设为通用设计尺寸。</p>
			<Button
				onClick={() => {
					setCustom(DEFAULT_SCREEN_SIZE);
					setDevice(MOBILE_LIST.ANDROID_STANDARD);
				}}
			>
				恢复标准尺寸
			</Button>
		</div>
	);
};
export default ScreenSettings;
