import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";
import { TimeFormatSelect } from "./time-format-select";

describe("TimeFormatSelect", () => {
	beforeAll(() => {
		// Radix Select relies on pointer capture and scrollIntoView, which jsdom lacks.
		HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
		HTMLElement.prototype.releasePointerCapture = vi.fn();
		HTMLElement.prototype.scrollIntoView = vi.fn();
	});

	let getItem: MockInstance<Storage["getItem"]>;
	let setItem: MockInstance<Storage["setItem"]>;

	beforeEach(() => {
		getItem = vi.spyOn(localStorage, "getItem").mockReturnValue(null);
		setItem = vi.spyOn(localStorage, "setItem").mockClear();
	});

	it("shows the 12-hour clock by default, with an example", () => {
		render(<TimeFormatSelect />);

		const trigger = screen.getByRole("combobox", { name: "Time Format" });
		expect(trigger).toHaveTextContent("12-hour");
		expect(trigger).toHaveTextContent("01:30 PM");
	});

	it("shows the saved 24-hour preference", () => {
		getItem.mockReturnValue('"24h"');
		render(<TimeFormatSelect />);

		const trigger = screen.getByRole("combobox", { name: "Time Format" });
		expect(trigger).toHaveTextContent("24-hour");
		expect(trigger).toHaveTextContent("13:30");
	});

	it("saves the selected time format", async () => {
		const user = userEvent.setup();
		render(<TimeFormatSelect />);

		await user.click(screen.getByRole("combobox", { name: "Time Format" }));
		await user.click(screen.getByRole("option", { name: /24-hour/ }));

		expect(
			screen.getByRole("combobox", { name: "Time Format" }),
		).toHaveTextContent("24-hour");
		expect(setItem).toHaveBeenCalledWith("prefect-time-format", '"24h"');
	});
});
