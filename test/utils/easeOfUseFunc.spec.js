import todaysDateFunc from "../../utils/easeOfUseFunc";

describe("Ease Of Use Function Checks", () => {
  it("should return a date string in the format yyyy-mm-dd", () => {
    const date = todaysDateFunc();
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("should return today's date in Central Time Zone", () => {
    const date = new Date();
    const options = { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit" };
    const expectedDate = date.toLocaleDateString("en-CA", options);
    const actualDate = todaysDateFunc();
    expect(actualDate).toBe(expectedDate);
  });
});
