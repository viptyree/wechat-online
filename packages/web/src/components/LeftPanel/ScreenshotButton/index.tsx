import { exportScaleAtom } from "@/stateV2/device";
import { CameraOutlined } from "@ant-design/icons";
import { App, Button, type ButtonProps, Modal, Spin } from "antd";
import { saveAs } from "file-saver";
import { useAtomValue } from "jotai";
import { useRef, useState } from "react";
import { exportScreen } from "./export";

type Props = { buttonProps?: ButtonProps };

const ScreenshotButton = ({ buttonProps }: Props) => {
	const { message } = App.useApp();
	const scale = useAtomValue(exportScaleAtom);
	const [loading, setLoading] = useState(false);
	const pending = useRef(false);
	const handleCreateScreenshot = async () => {
		if (pending.current) return;
		pending.current = true;
		setLoading(true);
		try {
			const screen = document.getElementById("screen");
			if (!screen) throw new Error("未找到聊天画面");
			const ratio = [1, 2, 3].includes(scale) ? scale : 3;
			const width = screen.offsetWidth * ratio;
			const height = screen.offsetHeight * ratio;
			const blob = await exportScreen(screen, ratio);
			saveAs(blob, `wechat-${width}x${height}.png`);
			message.success("PNG 已导出");
		} catch (error) {
			message.error(error instanceof Error ? error.message : "导出失败，请重试");
		} finally {
			pending.current = false;
			setLoading(false);
		}
	};
	return (
		<>
			<Button
				icon={<CameraOutlined />}
				{...buttonProps}
				onClick={handleCreateScreenshot}
				loading={loading}
			/>
			<Modal
				open={loading}
				title="正在生成 PNG"
				footer={null}
				closable={false}
				keyboard={false}
				maskClosable={false}
				centered
				width={320}
			>
				<div className="export-progress">
					<Spin />
					<span>正在处理字体与图片，请稍候…</span>
				</div>
			</Modal>
		</>
	);
};
export default ScreenshotButton;
