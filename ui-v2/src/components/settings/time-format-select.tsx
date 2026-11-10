import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useTimeFormat } from "@/hooks/use-time-format";
import { formatWithTimeFormat, type TimeFormat } from "@/utils/date";

const TIME_FORMAT_LABELS: Record<TimeFormat, string> = {
	"12h": "12-hour",
	"24h": "24-hour",
};

// 1:30:00 PM, used to preview each option.
const EXAMPLE_TIME = new Date(2024, 0, 1, 13, 30, 0);

const TimeFormatOption = ({ timeFormat }: { timeFormat: TimeFormat }) => (
	<div className="flex items-center justify-between gap-2 w-full">
		<span>{TIME_FORMAT_LABELS[timeFormat]}</span>
		<span className="text-muted-foreground">
			{formatWithTimeFormat(EXAMPLE_TIME, "hh:mm a", timeFormat)}
		</span>
	</div>
);

export const TimeFormatSelect = () => {
	const { timeFormat, setTimeFormat, timeFormats } = useTimeFormat();

	return (
		<div className="flex flex-col gap-1">
			<label htmlFor="time-format-select">Time Format</label>
			<Select
				value={timeFormat}
				onValueChange={(value) => {
					const format = timeFormats.find((format) => format === value);
					if (format) setTimeFormat(format);
				}}
			>
				<SelectTrigger className="w-96" id="time-format-select">
					<SelectValue placeholder="Select a time format">
						<TimeFormatOption timeFormat={timeFormat} />
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						{timeFormats.map((format) => (
							<SelectItem key={format} value={format}>
								<TimeFormatOption timeFormat={format} />
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
		</div>
	);
};
