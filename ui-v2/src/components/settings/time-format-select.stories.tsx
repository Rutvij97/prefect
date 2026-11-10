import type { Meta, StoryObj } from "@storybook/react";
import { TimeFormatSelect } from "./time-format-select";

const meta = {
	title: "Components/Settings/TimeFormatSelect",
	component: TimeFormatSelect,
} satisfies Meta<typeof TimeFormatSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
