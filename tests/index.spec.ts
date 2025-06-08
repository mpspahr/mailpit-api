import {
  jest,
  describe,
  beforeEach,
  afterEach,
  expect,
  test,
} from "@jest/globals";
import axios, { AxiosInstance } from "axios";
import { MailpitClient } from "../src/index";

jest.mock("axios");

describe("MailpitClient", () => {
  let client: MailpitClient;
  let mockedAxios: jest.Mocked<AxiosInstance>;

  beforeEach(() => {
    mockedAxios = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<AxiosInstance>;

    // Mock axios.create to return our mocked instance
    (axios.create as jest.Mock).mockReturnValue(mockedAxios);

    // Type-safe mock of isAxiosError
    (axios.isAxiosError as unknown as jest.Mock).mockImplementation((error) => {
      return (
        error &&
        typeof error === "object" &&
        "name" in error &&
        error.name === "AxiosError"
      );
    });

    client = new MailpitClient("http://localhost:8025");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Methods that could be skipped in e2e if feature not enabled
  test("should call releaseMessage() and return ok", async () => {
    mockedAxios.post.mockResolvedValue({ data: "ok" });
    const result = await client.releaseMessage("id", { To: ["a@b.com"] });
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/api/v1/message/id/release",
      { To: ["a@b.com"] },
    );
    expect(result).toBe("ok");
  });

  test("should call spamAssassinCheck() and return spam check response", async () => {
    const mockData = { Errors: 0, IsSpam: false, Rules: [], Score: 0 };
    mockedAxios.get.mockResolvedValue({ data: mockData });
    const result = await client.spamAssassinCheck();
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/api/v1/message/latest/sa-check",
    );
    expect(result).toEqual(mockData);
  });

  const mockData = {
    Authentication: {
      ErrorCode: 451,
      Probability: 5,
    },
    Recipient: {
      ErrorCode: 451,
      Probability: 5,
    },
    Sender: {
      ErrorCode: 451,
      Probability: 5,
    },
  };

  test("should call getChaosTriggers() and return triggers", async () => {
    mockedAxios.get.mockResolvedValue({ data: mockData });
    const result = await client.getChaosTriggers();
    expect(mockedAxios.get).toHaveBeenCalledWith("/api/v1/chaos");
    expect(result).toEqual(mockData);
  });

  test("should call setChaosTriggers() and return ok", async () => {
    mockedAxios.put.mockResolvedValue({ data: mockData });
    const result = await client.setChaosTriggers();
    expect(mockedAxios.put).toHaveBeenCalledWith("/api/v1/chaos", {});
    expect(result).toEqual(mockData);
  });

  // Error handling cases
  test("should handle NOT AxiosError", async () => {
    mockedAxios.get.mockRejectedValue({ response: { data: "error" } });
    await expect(client.getInfo()).rejects.toThrow();
  });

  test("should handle AxiosError with a response", async () => {
    const error = {
      name: "AxiosError",
      message: "Response Error",
      config: { url: "/api/v1/info", method: "GET" },
      response: {
        status: 500,
        data: "Boom!",

        statusText: "Internal Server Error",
      },
    };
    mockedAxios.get.mockRejectedValue(error);
    await expect(client.getInfo()).rejects.toThrow(
      'Mailpit API Error: 500 Internal Server Error at GET /api/v1/info: "Boom!"',
    );
  });

  test("should handle AxiosError without a response but with a request", async () => {
    const error = {
      name: "AxiosError",
      config: { url: "/api/v1/info", method: "GET" },
      request: {},
    };
    mockedAxios.get.mockRejectedValue(error);
    await expect(client.getInfo()).rejects.toThrow(
      "Mailpit API Error: No response received from server at GET /api/v1/info",
    );
  });

  test("should handle AxiosError with no request, no response, no method, and no url", async () => {
    const error = {
      name: "AxiosError",
      message: "Something Other Error",
    };
    mockedAxios.get.mockRejectedValue(error);
    await expect(client.getInfo()).rejects.toThrow(
      /Mailpit API Error: .+ at UNKNOWN METHOD UNKNOWN URL/,
    );
  });
});
