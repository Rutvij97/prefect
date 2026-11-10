import { differenceInSeconds, format, isBefore } from "date-fns";

import { secondsToApproximateString } from "./seconds";

const dateFormat = "MMM do, yyyy";
const timeFormat = "hh:mm a";
const dateTimeFormat = `${dateFormat} 'at' ${timeFormat}`;

const timeNumericFormat = "hh:mm:ss a";
const timeNumericShortFormat = "hh:mm a";
const dateNumericFormat = "yyyy/MM/dd";
const dateTimeNumericFormat = `${dateNumericFormat} ${timeNumericFormat}`;
const dateTimeNumericShortFormat = `${dateNumericFormat} ${timeNumericShortFormat}`;

export const dateFormats = {
	date: dateFormat,
	time: timeFormat,
	dateTime: dateTimeFormat,
	timeNumeric: timeNumericFormat,
	timeNumericShort: timeNumericShortFormat,
	dateNumeric: dateNumericFormat,
	dateTimeNumeric: dateTimeNumericFormat,
	dateTimeNumericShort: dateTimeNumericShortFormat,
} as const;

type DateFormat = keyof typeof dateFormats;

export const TIME_FORMATS = ["12h", "24h"] as const;

export type TimeFormat = (typeof TIME_FORMATS)[number];

export const TIME_FORMAT_STORAGE_KEY = "prefect-time-format";

function isTimeFormat(value: unknown): value is TimeFormat {
	return TIME_FORMATS.some((timeFormat) => timeFormat === value);
}

/**
 * Returns the user's preferred clock ("12h" or "24h"), as saved on the
 * settings page. Defaults to "12h".
 */
export function getTimeFormatPreference(): TimeFormat {
	try {
		const item = localStorage.getItem(TIME_FORMAT_STORAGE_KEY);
		const value: unknown = item ? JSON.parse(item) : null;
		return isTimeFormat(value) ? value : "12h";
	} catch {
		return "12h";
	}
}

/**
 * Converts a date-fns format pattern that uses a 12-hour clock to the given
 * time format. For "24h", 12-hour tokens (`h`, `hh`) become 24-hour tokens
 * (`H`, `HH`) and AM/PM markers (`a`, `aa`, ...) are removed. Quoted literals
 * such as `'at'` are left untouched.
 */
export function applyTimeFormat(
	pattern: string,
	timeFormat: TimeFormat = getTimeFormatPreference(),
): string {
	if (timeFormat === "12h") {
		return pattern;
	}

	return (
		pattern
			// Split into quoted literals and pattern segments, and only rewrite the latter.
			.split(/('(?:[^']|'')*')/)
			.map((segment) =>
				segment.startsWith("'")
					? segment
					: segment.replace(/\s*a+/g, "").replace(/h/g, "H"),
			)
			.join("")
	);
}

/**
 * Formats a date with a date-fns pattern, honoring the user's 12/24-hour
 * clock preference for the time part.
 */
export function formatWithTimeFormat(
	value: Date | number | string,
	pattern: string,
	timeFormat: TimeFormat = getTimeFormatPreference(),
): string {
	const date = typeof value === "string" ? toDate(value) : value;

	return format(date, applyTimeFormat(pattern, timeFormat));
}

/**
 * Whether `Intl` / `toLocaleString` options should use a 12-hour clock.
 */
export function isHour12(
	timeFormat: TimeFormat = getTimeFormatPreference(),
): boolean {
	return timeFormat === "12h";
}

function toDate(value: Date | string): Date {
	return new Date(value);
}

export function formatDate(
	value: Date | string,
	type: DateFormat = "date",
): string {
	return formatWithTimeFormat(value, dateFormats[type]);
}

/**
 * Formats a date as a relative time string (e.g., "25s ago" or "in 5m")
 * Uses compact format from secondsToApproximateString
 * @param value - The date to format
 * @param comparedTo - The date to compare against (defaults to now)
 * @returns A compact relative time string like "25s ago" or "in 5m"
 */
export function formatDateTimeRelative(
	value: Date | string,
	comparedTo: Date | string = new Date(),
): string {
	const valueDate = toDate(value);
	const compareDate = toDate(comparedTo);
	const seconds = differenceInSeconds(compareDate, valueDate);
	const past = isBefore(valueDate, compareDate);
	const formatted = secondsToApproximateString(Math.abs(seconds));

	if (past) {
		return `${formatted} ago`;
	}

	return `in ${formatted}`;
}

/**
 * Returns the browser's IANA time zone, or "UTC" when the browser doesn't
 * report one.
 */
export function getLocalTimezone(): string {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
	} catch {
		return "UTC";
	}
}
