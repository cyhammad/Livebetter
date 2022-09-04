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
      {parts
        .filter((part) => !!part)
        .flatMap((part, index) =>
          part ? (index !== 0 ? [separator, part] : part) : []
        )}
    </>
  );
};
