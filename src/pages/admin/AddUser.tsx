import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCreateUserMutation } from "@/redux/features/user/userApi";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Shield, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router";

const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  roles: z.array(z.string()).min(1, "At least one role is required"),
});

type UserFormValues = z.infer<typeof userSchema>;

const ROLES = [
  {
    value: "superadmin",
    label: "Super Admin",
    color: "text-red-600 dark:text-red-400",
  },
  {
    value: "admin",
    label: "Admin",
    color: "text-orange-600 dark:text-orange-400",
  },
  {
    value: "contentwriter",
    label: "Content Writer",
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    value: "contentdesigner",
    label: "Content Designer",
    color: "text-purple-600 dark:text-purple-400",
  },
  {
    value: "videoeditor",
    label: "Video Editor",
    color: "text-green-600 dark:text-green-400",
  },
];

export default function AddUser() {
  const navigate = useNavigate();
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      roles: [],
    },
  });

  const [createUser, { isLoading }] = useCreateUserMutation();

  const handleRoleToggle = (roleValue: string) => {
    const newRoles = selectedRoles.includes(roleValue)
      ? selectedRoles.filter((r) => r !== roleValue)
      : [...selectedRoles, roleValue];

    setSelectedRoles(newRoles);
    setValue("roles", newRoles);
  };

  const onSubmit = async (data: UserFormValues) => {
    try {
      await createUser(data).unwrap();
      toast.success("User created successfully");
      navigate("/admin/manage-users");
    } catch (error) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to create user");
      console.error("Error creating user:", error);
    }
  };

  return (
    <div className="space-y-6 mt-2">
      <div className="flex items-center gap-4 bg-linear-to-r from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20 p-6 rounded-lg border">
        <Link to="/admin/manage-users">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold bg-linear-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
            Add New User
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create a new user account with roles and permissions
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the user's credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  {...register("username")}
                  placeholder="Enter username"
                />
                {errors.username && (
                  <p className="text-sm text-destructive">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="Enter password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Role Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Role Assignment
              </CardTitle>
              <CardDescription>
                Select one or more roles for this user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {ROLES.map((role) => (
                  <div
                    key={role.value}
                    className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      id={role.value}
                      checked={selectedRoles.includes(role.value)}
                      onCheckedChange={() => handleRoleToggle(role.value)}
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={role.value}
                        className={`text-sm font-medium leading-none cursor-pointer ${role.color}`}
                      >
                        <Shield className="inline h-4 w-4 mr-1" />
                        {role.label}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              {errors.roles && (
                <p className="text-sm text-destructive mt-2">
                  {errors.roles.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-linear-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
            >
              {isLoading ? "Creating..." : "Create User"}
            </Button>
            <Link to="/admin/manage-users">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
