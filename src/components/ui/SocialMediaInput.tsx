import { Input } from "./input";
import { Label } from "./label";

interface SocialMediaInputProps {
  platform: string;
  register: any;
}

export function SocialMediaInput({ platform, register }: SocialMediaInputProps) {
  const platformId = platform.toLowerCase();

  return (
    <div className="mb-4">
      <h3 className="font-medium mb-2">{platform}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor={`${platformId}Url`}>URL</Label>
          <Input
            id={`${platformId}Url`}
            {...register(`${platformId}Url`)}
            placeholder={`${platform} URL`}
          />
        </div>
        <div>
          <Label htmlFor={`${platformId}Username`}>Username</Label>
          <Input
            id={`${platformId}Username`}
            {...register(`${platformId}Username`)}
            placeholder="Username"
          />
        </div>
        <div>
          <Label htmlFor={`${platformId}Password`}>Password</Label>
          <Input
            id={`${platformId}Password`}
            type="password"
            {...register(`${platformId}Password`)}
            placeholder="Password"
          />
        </div>
      </div>
    </div>
  );
}
