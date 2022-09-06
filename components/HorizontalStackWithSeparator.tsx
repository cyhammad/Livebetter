import React, { Fragment } from "react";

interface HorizontalStackWithSeparatorProps {
  separator: React.ReactNode;
  parts: React.ReactNode[];
}

export const HorizontalStackWithSeparator = ({
  separator,
  parts,
}: HorizontalStackWithSeparatorProps) => {
  return (
    <>
      {parts.reduce((acc: React.ReactNode[], part, index) => {
        if (part) {
          if (acc.length !== 0) {
            acc.push(
              <Fragment key={`${index}-separator`}>{separator}</Fragment>
            );
          }

          acc.push(<Fragment key={`${index}-part`}>{part}</Fragment>);
        }

        return acc;
      }, [])}
    </>
  );
};
