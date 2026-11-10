import { act, renderHook } from "@testing-library/react";
import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";
import { getTimeFormatPreference } from "@/utils/date";
import { useTimeFormat } from "./use-time-format";

describe("useTimeFormat", () => {
	let getItem: MockInstance<Storage["getItem"]>;
	let setItem: MockInstance<Storage["setItem"]>;

	beforeEach(() => {
		getItem = vi.spyOn(localStorage, "getItem").mockReturnValue(null);
		setItem = vi.spyOn(localStorage, "setItem").mockClear();
	});

	it("defaults to a 12-hour clock", () => {
		const { result } = renderHook(() => useTimeFormat());
		expect(result.current.timeFormat).toBe("12h");
		expect(result.current.timeFormats).toEqual(["12h", "24h"]);
	});

	it("persists the time format in localStorage", () => {
		const { result } = renderHook(() => useTimeFormat());
		act(() => {
			result.current.setTimeFormat("24h");
		});
		expect(result.current.timeFormat).toBe("24h");
		expect(setItem).toHaveBeenCalledWith("prefect-time-format", '"24h"');
	});

	it("saves a value the date formatting utilities can read", () => {
		const { result } = renderHook(() => useTimeFormat());
		act(() => {
			result.current.setTimeFormat("24h");
		});
		const saved = setItem.mock.calls.findLast(
			([key]) => key === "prefect-time-format",
		);
		getItem.mockReturnValue(saved?.[1] ?? null);
		expect(getTimeFormatPreference()).toBe("24h");
	});

	it("restores the time format from localStorage on mount", () => {
		getItem.mockReturnValue('"24h"');
		const { result } = renderHook(() => useTimeFormat());
		expect(result.current.timeFormat).toBe("24h");
	});
});
