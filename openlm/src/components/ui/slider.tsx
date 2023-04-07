import { Dispatch, SetStateAction } from "react";
import * as Slider from "@radix-ui/react-slider";

interface ParamSliderProps {
    paramName: string,
    defaultValue: number,
    value: number,
    max: number,
    step: number,
    setValue: (paramName: string, value: number) => void,
}

const ParamSlider = (props: ParamSliderProps) => {
    const {paramName, defaultValue, value, max, step, setValue} = props;

    const onUpdate = (val: number[]) => {
        if ( typeof val[0] === "number")
        setValue(paramName, val[0]);
    }

    return (
        <form>
            <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-5"
                defaultValue={[defaultValue]}
                max={max}
                step={step}
                aria-label={paramName}
                onValueChange={onUpdate}
                value={[value]}
            >
                <Slider.Track className="bg-black relative grow rounded-full h-[3px]">
                    <Slider.Range className="absolute bg-white rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-5 h-5 bg-white shadow-[0_2px_10px] shadow-blackA7 rounded-[10px] hover:bg-violet3 focus:outline-none focus:shadow-[0_0_0_5px] focus:shadow-blackA8" />
            </Slider.Root>
        </form>
    )
}

export default ParamSlider;