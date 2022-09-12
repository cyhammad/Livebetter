import {
  RestaurantMenuItem,
  RestaurantMenuItemProps,
} from "components/RestaurantMenuItem";

interface RestaurantAddOnItemProps extends RestaurantMenuItemProps {
  onChange: (count: number) => void;
  value: number;
}

export const RestaurantAddOnItem = ({
  value,
  onChange,
  menuItem,
  ...props
}: RestaurantAddOnItemProps) => {
  return (
    <RestaurantMenuItem menuItem={menuItem} {...props}>
      {!menuItem.outOfStock ? (
        <span className="flex gap-2 items-center">
          <button
            disabled={!!menuItem.outOfStock}
            onClick={() => {
              const nextValue = value <= 1 ? 0 : value - 1;

              onChange(nextValue);
            }}
            className="flex items-center justify-center text-xs leading-tight h-5 w-5 rounded-full bg-slate-100 border border-slate-200 text-white"
          >
            <span className="-mt-0.5 text-slate-800 text-center ">&minus;</span>
          </button>
          <span className="text-sm">{value}</span>
          <button
            disabled={!!menuItem.outOfStock}
            onClick={() => {
              onChange(value + 1);
            }}
            className="flex gap-1 items-center text-xs leading-tight  px-2 py-1 rounded-full bg-sky-600 text-white"
          >
            Add <span className="-mt-0.5">+</span>
          </button>
        </span>
      ) : null}
    </RestaurantMenuItem>
  );
};
