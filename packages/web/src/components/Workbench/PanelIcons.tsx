const PanelIcon = ({ right = false }: { right?: boolean }) => (
	<svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
		<rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
		<path d={right ? "M13 3v14" : "M7 3v14"} stroke="currentColor" strokeWidth="1.5" />
	</svg>
);
export const PanelLeftClose = () => <PanelIcon />;
export const PanelRightClose = () => <PanelIcon right />;
