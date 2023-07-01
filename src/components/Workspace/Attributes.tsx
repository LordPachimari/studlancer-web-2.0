/* eslint-disable @typescript-eslint/no-misused-promises */
import { CalendarIcon, Gem, Users2 } from "lucide-react";
import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { format } from "date-fns";
import TextareaAutosize from "react-textarea-autosize";
import { SubtopicSuggestion, Topics, TopicsType } from "~/types/types";
import { Badge } from "~/ui/Badge";
import { Button } from "~/ui/Button";
import { Calendar } from "~/ui/Calendar";
import { Input } from "~/ui/Input";
import { Popover, PopoverContent, PopoverTrigger } from "~/ui/Popover";
import {
  Select as MySelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/ui/Select";
import Select, {
  MultiValue,
  OptionProps,
  StylesConfig,
  components,
} from "react-select";
import makeAnimated from "react-select/animated";
import { cn } from "~/utils/cn";
import SingleValue from "react-select/dist/declarations/src/components/SingleValue";
import { produce } from "immer";
import { AttributeError } from "~/zustand/workspace";
import { useAutoAnimate } from "@formkit/auto-animate/react";
export const Title = ({
  title,
  placeholder,
  handleTitleChange,
  error,
}: {
  title: string | undefined;
  placeholder: string;
  handleTitleChange: (title: string) => Promise<void> | undefined;
  error: AttributeError;
}) => {
  const [titleState, setTitleState] = useState("");
  const [parent, enableAnimations] = useAutoAnimate(/* optional config */);
  useEffect(() => {
    setTitleState(title || "");
  }, [title]);
  return (
    <div
      className="prose prose-stone dark:prose-invert mx-auto w-full border-red-100 "
      ref={parent}
    >
      <TextareaAutosize
        autoFocus
        id="title"
        defaultValue={titleState}
        placeholder={placeholder}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onInput={(e) => handleTitleChange(e.currentTarget.value)}
        className={cn(
          "w-full resize-none appearance-none overflow-hidden rounded-md bg-transparent text-4xl font-bold focus:outline-none",
          { "border-[1px]": error.error, "border-red-500": error.error }
        )}
        // {...register("title")}
      />
      {error.error && (
        <div className="absolute left-[-140px] top-10 mt-[-35px] rounded border border-red-500 bg-white px-3 py-2 text-xs text-red-500 shadow">
          <div className="absolute bottom-[-10px] left-4 h-10 w-0 bg-red-500"></div>
          {error.message}
        </div>
      )}
    </div>
  );
};
export const TopicSelect = ({
  handleTopicChange,
  topic,
  error,
}: {
  topic?: TopicsType;
  handleTopicChange: (topic: TopicsType) => Promise<void>;

  error: AttributeError;
}) => {
  const [parent, enableAnimations] = useAutoAnimate(/* optional config */);
  const [topicState, setTopicState] = useState<TopicsType | undefined>(
    undefined
  );
  useEffect(() => {
    setTopicState(topic);
  }, [topic]);
  return (
    <div
      ref={parent}
      className={cn("my-1 w-fit ", {
        "border-[1px]": error.error,
        "border-red-500": error.error,
      })}
    >
      <MySelect
        onValueChange={async (value) => {
          await handleTopicChange(value as TopicsType);
          setTopicState(value as TopicsType);
        }}
        value={topicState}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select topic" />
        </SelectTrigger>
        <SelectContent>
          {Topics.map((t, i) => (
            <SelectItem value={t} key={i}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </MySelect>
      {error.error && (
        <div className="top-21 absolute left-[-140px] mt-[-35px] rounded border border-red-500 bg-white px-3 py-2 text-xs text-red-500 shadow">
          <div className="absolute bottom-[-10px] left-4 h-10 w-0 bg-red-500"></div>
          {error.message}
        </div>
      )}
    </div>
  );
};

interface BadgeProps {
  text: string;
  id: number;
  removeBadge: (id: number) => void;
}

const CustomBadge: React.FC<BadgeProps> = ({ text, id, removeBadge }) => (
  <span
    onClick={() => removeBadge(id)}
    className="mr-2 inline-block w-10 cursor-pointer rounded-full bg-blue-500 px-3 py-1 text-sm font-semibold text-white"
  >
    {text}
  </span>
);

const animatedComponents = makeAnimated();
export interface OptionType {
  value: string;
  label: string;
  badge?: string;
}

const customStyles: StylesConfig<OptionType, false> = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? "orange" : base.borderColor,
    boxShadow: state.isFocused ? "0 0 0 0.2px orange" : base.boxShadow,
    "&:hover": {
      borderColor: state.isFocused ? "orange" : base.borderColor,
    },
  }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    return {
      ...styles,
      backgroundColor: isFocused ? "whitesmoke" : "",
      color: "black",
    };
  },
};
export const Subtopic = ({
  subtopic,
  handleSubtopicChange,
  error,
}: {
  subtopic: string[] | undefined;

  error: AttributeError;
  handleSubtopicChange: ({
    subtopics,
  }: {
    subtopics: MultiValue<OptionType>;
  }) => Promise<void>;
}) => {
  const [parent, enableAnimations] = useAutoAnimate(/* optional config */);
  const [subtopicState, setSubtopicState] = useState<MultiValue<OptionType>>();
  useEffect(() => {
    const multiVal = subtopic
      ? subtopic.map((v) => ({ value: v, label: v }))
      : [];
    setSubtopicState(multiVal as MultiValue<OptionType>);
  }, [subtopic]);
  const options = SubtopicSuggestion.map((topic) => ({
    value: topic,
    label: topic.toLocaleLowerCase(),
  }));

  return (
    <div
      ref={parent}
      className={cn("my-1 w-fit", {
        "border-[1px]": error.error,
        "border-red-500": error.error,
      })}
    >
      {" "}
      <Select
        options={options}
        components={animatedComponents}
        isMulti
        value={subtopicState}
        placeholder="Select subtopic"
        closeMenuOnSelect={false}
        styles={customStyles}
        classNames={{
          control: (state) => (state.isFocused ? "#f97316" : "border-grey-100"),
        }}
        onChange={async (val) => {
          await handleSubtopicChange({
            subtopics: val as MultiValue<OptionType>,
          }),
            setSubtopicState((old) => val as MultiValue<OptionType>);
        }}
      />
      {error.error && (
        <div className="top-25 absolute left-[-140px] mt-[-35px] rounded border border-red-500 bg-white px-3 py-2 text-xs text-red-500 shadow">
          <div className="absolute bottom-[-10px] left-4 h-10 w-0 bg-red-500"></div>
          {error.message}
        </div>
      )}
    </div>
  );
};
export const Reward = ({
  reward,
  handleRewardChange,
  error,
}: {
  reward: number | undefined;
  error: AttributeError;
  handleRewardChange: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
}) => {
  const [parent, enableAnimations] = useAutoAnimate(/* optional config */);
  const [stateReward, setStateReward] = useState<number | "">("");
  useEffect(() => {
    setStateReward(reward || "");
  }, [reward]);
  return (
    <div className="my-1 flex items-center gap-2 " ref={parent}>
      <Gem className="text-purple-500" />
      <Input
        className={cn("w-40 p-2 ", {
          "border-[1px]": error.error,
          "border-red-500": error.error,
        })}
        placeholder="Enter amount"
        value={stateReward}
        type="number"
        onChange={async (e) => {
          const inputValue = e.target.value;
          if (inputValue === "" || Number(inputValue) > 0) {
            setStateReward(inputValue === "" ? "" : Number(inputValue));
            await handleRewardChange(e);
          }
        }}
        min={1}
      />
      {error.error && (
        <div className="top-50 absolute left-[-140px]  rounded border border-red-500 bg-white px-3 py-2 text-xs text-red-500 shadow">
          <div className="absolute bottom-[-10px] left-4 h-10 w-0 bg-red-500"></div>
          {error.message}
        </div>
      )}
    </div>
  );
};
export const Slots = ({
  handleSlotsChange,
  slots,
  error,
}: {
  handleSlotsChange: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
  slots: number | undefined;

  error: AttributeError;
}) => {
  const [parent, enableAnimations] = useAutoAnimate(/* optional config */);
  const [stateSlots, setStateSlots] = useState<number | "">("");
  useEffect(() => {
    setStateSlots(slots || "");
  }, [slots]);
  return (
    <div className="my-1 flex items-center gap-2" ref={parent}>
      <Users2 className="text-gray-500" />
      <Input
        className={cn("w-40 p-2 ", {
          "border-[1px]": error.error,
          "border-red-500": error.error,
        })}
        placeholder="Enter amount"
        value={stateSlots}
        type="number"
        onChange={async (e) => {
          const inputValue = e.target.value;
          if (inputValue === "" || Number(inputValue) > 0) {
            setStateSlots(inputValue === "" ? "" : Number(inputValue));
            await handleSlotsChange(e);
          }
        }}
        min={1}
      />
      {error.error && (
        <div className="top-50 absolute right-[-100px]  rounded border border-red-500 bg-white px-3 py-2 text-xs text-red-500 shadow">
          <div className="absolute bottom-[-10px] left-4 h-10 w-0 bg-red-500"></div>
          {error.message}
        </div>
      )}
    </div>
  );
};
export const DatePicker = ({
  date,

  handleDateChange,
  error,
}: {
  handleDateChange: (e: Date | undefined) => Promise<void>;

  date: string | undefined;

  error: AttributeError;
}) => {
  const [parent, enableAnimations] = useAutoAnimate(/* optional config */);
  const [dateState, setDateState] = useState<Date>();
  useEffect(() => {
    if (date) {
      const newDate = new Date(date);
      setDateState(newDate);
    } else {
      setDateState(undefined);
    }
  }, [date]);

  return (
    <div
      ref={parent}
      className={cn("centerDivVertically my-1 w-fit", {
        "border-[1px]": error.error,
        "border-red-500": error.error,
      })}
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal md:w-[280px]",
              !dateState && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateState ? (
              format(dateState, "PPP")
            ) : (
              <span>Select deadline</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={dateState}
            onSelect={async (val) => {
              setDateState(val), await handleDateChange(val);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {error.error && (
        <div className="top-49 absolute left-[-140px] mt-[-35px] rounded border border-red-500 bg-white px-3 py-2 text-xs text-red-500 shadow">
          <div className="absolute bottom-[-10px] left-4 h-10 w-0 bg-red-500"></div>
          {error.message}
        </div>
      )}
    </div>
  );
};
