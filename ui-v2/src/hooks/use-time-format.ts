import {
	TIME_FORMAT_STORAGE_KEY,
	TIME_FORMATS,
	type TimeFormat,
} from "@/utils/date";
import { useLocalStorage } from "./use-local-storage";

/**
 * The user's preferred clock for displaying times ("12h" or "24h"),
 * persisted in local storage and read by the date formatting utilities.
 */
export function useTimeFormat() {
	const [timeFormat, setTimeFormat] = useLocalStorage<TimeFormat>(
		TIME_FORMAT_STORAGE_KEY,
		"12h",
	);

	return { timeFormat, setTimeFormat, timeFormats: TIME_FORMATS };
}
