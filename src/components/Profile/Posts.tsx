import { Card, CardContent, CardHeader } from "~/ui/Card";

export default function UserPosts() {
  return (
    <Card className="h-[600px] w-full rounded-xl p-4 drop-shadow-sm  dark:border-slate-6 ">
      <CardHeader className="h-[70px]"></CardHeader>
      <CardContent className="h-[500px]  rounded-xl border-[1px]  bg-blue-2  shadow-inner dark:border-none dark:shadow-blue-6"></CardContent>
    </Card>
  );
}
