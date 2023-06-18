import Loadable from "../src";
import { useRef } from "react";
import { render, waitFor } from "@testing-library/react";
import fireEvent from "@testing-library/user-event";

describe("react-loadable", () => {
  it("successful test", async () => {
    const TestRender = Loadable({
      loader: () => import("./TestComponent"),
      loading: () => "wait",
    });

    const { getByText } = render(<TestRender />);

    await waitFor(
      () => {
        expect(getByText("wait")).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    await waitFor(
      () => {
        expect(getByText("hello world")).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("failed test", async () => {
    const TestRender = Loadable({
      loader: () => import("./TestComponentt"),
      loading: ({ isError }) => (isError ? "failed" : "wait"),
    });

    const { getByText } = render(<TestRender />);

    await waitFor(
      () => {
        expect(getByText("wait")).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    await waitFor(
      () => {
        expect(getByText("failed")).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("custom render", async () => {
    const TestRender = Loadable({
      loader: () => import("./TestComponent"),
      loading: ({ isError }) => (isError ? "failed" : "wait"),
      render(loaded, props) {
        const Component = loaded;
        const ref = props.forwardRef || undefined;

        return <Component {...props} ref={ref} />;
      },
    });

    const ForwardRefTest = () => {
      const ref = useRef();

      return (
        <div>
          <TestRender forwardRef={ref} />
          <button type="button" onClick={ref.current?.toggle}>
            toggle
          </button>
        </div>
      );
    };

    const { getByText, rerender } = render(<ForwardRefTest />);

    await waitFor(
      () => {
        expect(getByText("wait")).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    await waitFor(
      () => {
        expect(getByText("hello world")).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    const toggleBtn = getByText("toggle");

    fireEvent.click(toggleBtn);

    rerender(<ForwardRefTest />);

    await waitFor(
      () => {
        expect(getByText("OPENED")).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    fireEvent.click(toggleBtn);

    rerender(<ForwardRefTest />);

    await waitFor(
      () => {
        expect(getByText("CLOSED")).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});
