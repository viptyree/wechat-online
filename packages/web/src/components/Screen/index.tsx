import { navigationAtom } from "@/stateV2/device";
import { Global, css } from "@emotion/react";
import { useAtomValue } from "jotai";
import { type CSSProperties, memo } from "react";
import { isDesktop, isMobileOnly } from "react-device-detect";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet } from "react-router-dom";

import Fallback from "../Fallback";
import DetectedOverall from "../NodeDetected/DetectedFloating";
import StatusBar from "../StatusBar";
import useDeviceConfig from "../useDeviceConfig";

const Screen = () => {
	const { screenSize, isAndroid } = useDeviceConfig();
	const navigation = useAtomValue(navigationAtom);

	const style: CSSProperties = isMobileOnly
		? { width: "100vw", height: "100dvh" }
		: {
				width: screenSize.width,
				height: screenSize.height,
			};

	return (
		<div style={style} className="relative flex flex-col overflow-hidden" id="screen">
			<Global
				styles={css`
          &::-webkit-scrollbar {
            display: none;
          }
        `}
			/>
			<DetectedOverall />
			{isDesktop && <StatusBar />}
			<ErrorBoundary FallbackComponent={Fallback}>
				<Outlet />
			</ErrorBoundary>
			{isDesktop && isAndroid && navigation !== "hidden" && (
				<div className="android-navigation" aria-hidden="true">
					{navigation === "gesture" ? (
						<span className="android-gesture" />
					) : (
						<>
							<span>◁</span>
							<span>○</span>
							<span>□</span>
						</>
					)}
				</div>
			)}
		</div>
	);
};

export default memo(Screen);
