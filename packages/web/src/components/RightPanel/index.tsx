import { activatedNodeAtom } from "@/stateV2/detectedNode";
import { Tabs } from "antd";
import { useAtomValue } from "jotai";
import { memo, useEffect, useState } from "react";
import MetaDataEditor from "../MetaDataEditor";
import ScreenSettings from "../Workbench/ScreenSettings";

const RightPanel = () => {
	const activatedNode = useAtomValue(activatedNodeAtom);
	const [tab, setTab] = useState("screen");
	useEffect(() => {
		setTab(activatedNode ? "properties" : "screen");
	}, [activatedNode]);
	return (
		<div className="properties-panel">
			<Tabs
				activeKey={tab}
				onChange={setTab}
				items={[
					{ key: "screen", label: "画面设置", children: <ScreenSettings /> },
					{
						key: "properties",
						label: "选中内容",
						children: (
							<div className="properties-editor">
								<MetaDataEditor />
							</div>
						),
					},
				]}
			/>
		</div>
	);
};
export default memo(RightPanel);
