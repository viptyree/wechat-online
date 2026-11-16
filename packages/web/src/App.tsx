import { App as AntdApp, Button, ConfigProvider } from "antd";
import { useState } from "react";
import { isMobileOnly } from "react-device-detect";
import { useTranslation } from "react-i18next";
import LeftPanel from "./components/LeftPanel";
import ScreenDevicesSelect from "./components/LeftPanel/ScreenDevicesSelect";
import ScreenshotButton from "./components/LeftPanel/ScreenshotButton";
import ModeSwitch from "./components/ModeSwitch";
import RightPanel from "./components/RightPanel";
import Screen from "./components/Screen";
import Tour from "./components/Tour";
import Canvas from "./components/Workbench/Canvas";
import { PanelLeftClose, PanelRightClose } from "./components/Workbench/PanelIcons";
import { SizeInputs, ZoomSelect } from "./components/Workbench/ScreenSettings";
import { ANTD_LANG_MAP } from "./i18n";
import "./components/Workbench/style.css";

const App = () => {
	const { i18n } = useTranslation();
	const [leftOpen, setLeftOpen] = useState(() => window.innerWidth > 1000);
	const [rightOpen, setRightOpen] = useState(() => window.innerWidth > 1000);
	if (isMobileOnly)
		return (
			<ConfigProvider locale={ANTD_LANG_MAP[i18n.language as keyof typeof ANTD_LANG_MAP]}>
				<AntdApp>
					<Screen />
				</AntdApp>
			</ConfigProvider>
		);
	return (
		<ConfigProvider
			locale={ANTD_LANG_MAP[i18n.language as keyof typeof ANTD_LANG_MAP]}
			theme={{ token: { colorPrimary: "#16805d", borderRadius: 8 } }}
		>
			<AntdApp className="workbench">
				<header className="workbench-header">
					<div className="workbench-brand">
						<span className="brand-mark">W</span>
						<div>
							<strong>WeChat Online</strong>
							<span>聊天画面工作台</span>
						</div>
					</div>
					<div className="header-actions">
						<ModeSwitch />
						<ScreenshotButton buttonProps={{ type: "primary", children: "导出 PNG" }} />
					</div>
				</header>
				<div className="workbench-toolbar">
					<div className="toolbar-group">
						<Button
							aria-label="切换内容面板"
							title="内容面板"
							onClick={() => setLeftOpen(!leftOpen)}
							icon={<PanelLeftClose />}
						/>
						<ScreenDevicesSelect />
					</div>
					<SizeInputs />
					<div className="toolbar-group">
						<ZoomSelect />
						<Button
							aria-label="切换属性面板"
							title="属性面板"
							onClick={() => setRightOpen(!rightOpen)}
							icon={<PanelRightClose />}
						/>
					</div>
				</div>
				<main
					className={`workbench-body ${leftOpen ? "" : "left-closed"} ${rightOpen ? "" : "right-closed"}`}
				>
					{leftOpen && (
						<aside className="workbench-left">
							<div className="panel-heading">
								内容与素材<span>CONTENT</span>
							</div>
							<LeftPanel />
						</aside>
					)}
					<Canvas />
					{rightOpen && (
						<aside className="workbench-right">
							<RightPanel />
						</aside>
					)}
				</main>
				<Tour />
			</AntdApp>
		</ConfigProvider>
	);
};
export default App;
