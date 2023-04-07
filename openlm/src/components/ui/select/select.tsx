import React, {Dispatch, SetStateAction} from 'react';
import * as Select from '@radix-ui/react-select';
import classnames from 'classnames';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';


interface SelectDropdownProps {
    label: string,
    options: string[],
    value: string,
    setValue: (value: string) => void
}

const SelectDropdown = (props: SelectDropdownProps) => {



    const {label, options, value, setValue} = props;
    return (
        <Select.Root
            value={value}
            onValueChange={(v) => setValue(v)}
        >
            <Select.Trigger
            className="inline-flex items-center justify-center hover:bg-slate-100 rounded px-[15px] text-[13px] leading-none h-[35px] gap-[5px] bg-white text-black shadow-[0_2px_10px] shadow-black/10 hover:bg-slate-100 focus:shadow-[0_0_0_2px] focus:shadow-black data-[placeholder]:text-gray-800 outline-none"
            aria-label="Food"
            >
            <Select.Value/>
            <Select.Icon className="text-black">
                <ChevronDownIcon />
            </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
            <Select.Content className="overflow-hidden bg-white rounded-md shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]">
                <Select.ScrollUpButton className="flex items-center justify-center h-[25px] bg-white text-black cursor-default">
                <ChevronUpIcon />
                </Select.ScrollUpButton>
                <Select.Viewport className="p-[5px]">
                <Select.Group>
                    <Select.Label className="px-[25px] text-xs leading-[25px] text-gray-800">
                    {label}
                    </Select.Label>
                    {options.map((opt, idx) =>
                        <SelectItem className="cursor-pointer hover:bg-black hover:text-white" key={idx} value={opt}>{opt}</SelectItem>
                    )}
                </Select.Group>
                </Select.Viewport>
                <Select.ScrollDownButton className="flex items-center justify-center h-[25px] bg-white text-black cursor-default">
                <ChevronDownIcon />
                </Select.ScrollDownButton>
            </Select.Content>
            </Select.Portal>
        </Select.Root>
    )
};

const SelectItem = React.forwardRef<HTMLDivElement, any>(({ children, className, ...props }, forwardedRef) => {
  return (
    <Select.Item
      className={classnames(
        'text-[13px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] pr-[35px] pl-[25px] relative select-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1',
        className
      )}
      {...props}
      ref={forwardedRef} 
    > 
      <Select.ItemText>{children}</Select.ItemText>
      <Select.ItemIndicator className="absolute left-0 w-[25px] inline-flex items-center justify-center">
        <CheckIcon />
      </Select.ItemIndicator>
    </Select.Item>
  );
});

export default SelectDropdown;
