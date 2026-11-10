import { mockBrowserTimezone } from "@tests/utils/browser";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	type MockInstance,
	test,
	vi,
} from "vitest";
import {
	applyTimeFormat,
	formatDate,
	formatWithTimeFormat,
	getLocalTimezone,
	getTimeFormatPreference,
	isHour12,
	TIME_FORMAT_STORAGE_KEY,
} from "./date";

describe("getLocalTimezone", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	test("returns the browser time zone", () => {
		mockBrowserTimezone("America/Chicago");

		expect(getLocalTimezone()).toBe("America/Chicago");
	});

	test("falls back to UTC when the browser reports no time zone", () => {
		mockBrowserTimezone(undefined);

		expect(getLocalTimezone()).toBe("UTC");
	});

	test("falls back to UTC when resolving the time zone throws", () => {
		vi.spyOn(
			Intl.DateTimeFormat.prototype,
			"resolvedOptions",
		).mockImplementation(() => {
			throw new RangeError("Invalid time zone");
		});

		expect(getLocalTimezone()).toBe("UTC");
	});
});

describe("applyTimeFormat", () => {
	test("leaves patterns unchanged for a 12-hour clock", () => {
		expect(applyTimeFormat("yyyy/MM/dd hh:mm:ss a", "12h")).toBe(
			"yyyy/MM/dd hh:mm:ss a",
		);
	});

	test.each([
		["hh:mm a", "HH:mm"],
		["h:mm:ss a", "H:mm:ss"],
		["yyyy/MM/dd hh:mm:ss a", "yyyy/MM/dd HH:mm:ss"],
		["MMM do, yyyy 'at' hh:mm:ss aa", "MMM do, yyyy 'at' HH:mm:ss"],
		["MMMM d, yyyy 'at' h:mm:ss a", "MMMM d, yyyy 'at' H:mm:ss"],
		["MMM do, yyyy", "MMM do, yyyy"],
	])("converts %s to %s for a 24-hour clock", (pattern, expected) => {
		expect(applyTimeFormat(pattern, "24h")).toBe(expected);
	});

	test("does not change quoted literals", () => {
		expect(applyTimeFormat("'hh a' hh:mm a", "24h")).toBe("'hh a' HH:mm");
	});
});

describe("getTimeFormatPreference", () => {
	let getItem: MockInstance<Storage["getItem"]>;

	beforeEach(() => {
		getItem = vi.spyOn(localStorage, "getItem");
	});

	test("defaults to a 12-hour clock", () => {
		getItem.mockReturnValue(null);

		expect(getTimeFormatPreference()).toBe("12h");
	});

	test("reads the saved preference", () => {
		getItem.mockReturnValue('"24h"');

		expect(getTimeFormatPreference()).toBe("24h");
		expect(getItem).toHaveBeenCalledWith(TIME_FORMAT_STORAGE_KEY);
	});

	test.each(['"36h"', "not json"])(
		"falls back to a 12-hour clock for invalid value %s",
		(value) => {
			getItem.mockReturnValue(value);

			expect(getTimeFormatPreference()).toBe("12h");
		},
	);
});

describe("formatDate and formatWithTimeFormat", () => {
	const afternoon = new Date(2024, 0, 15, 14, 5, 9);
	let getItem: MockInstance<Storage["getItem"]>;

	beforeEach(() => {
		getItem = vi.spyOn(localStorage, "getItem");
	});

	test("use a 12-hour clock by default", () => {
		getItem.mockReturnValue(null);

		expect(formatDate(afternoon, "dateTimeNumeric")).toBe(
			"2024/01/15 02:05:09 PM",
		);
		expect(formatWithTimeFormat(afternoon, "h:mm a")).toBe("2:05 PM");
	});

	test("use a 24-hour clock when preferred", () => {
		getItem.mockReturnValue('"24h"');

		expect(formatDate(afternoon, "dateTimeNumeric")).toBe(
			"2024/01/15 14:05:09",
		);
		expect(formatDate(afternoon, "dateTime")).toBe("Jan 15th, 2024 at 14:05");
		expect(formatWithTimeFormat(afternoon, "h:mm a")).toBe("14:05");
		expect(isHour12()).toBe(false);
	});

	test("an explicit time format overrides the preference", () => {
		getItem.mockReturnValue('"24h"');

		expect(formatWithTimeFormat(afternoon, "hh:mm a", "12h")).toBe("02:05 PM");
	});
});
