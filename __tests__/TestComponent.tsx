import { forwardRef, useImperativeHandle, useState } from "react";

const TestComponent = forwardRef(({}, ref) => {
  const [isOpen, setIsOpen] = useState(false);

  useImperativeHandle(
    ref,
    () => ({
      toggle: () => setIsOpen((isOpen) => !isOpen),
    }),
    []
  );

  return (
    <div>
      <div>hello world</div>
      {isOpen ? <div>OPENED</div> : <div>CLOSED</div>}
    </div>
  );
});

export default TestComponent;
