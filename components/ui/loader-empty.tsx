import Image from "next/image";

export const LoaderEmpty = () => {
    return (
        <div className="h-full w-full flex flex-col gap-y-16 items-center justify-center pb-40 ">
            <div className="flex flex-col h-72 w-full items-center justify-center bg-muted rounded-lg ">
                <div className="w-10 h-10 relative animate-spin">
                        <Image
                        alt="Logo"
                        src="/logo.png"
                        fill
                />
                </div>
                <p className="text-sm pt-4 text-muted-foreground pb-20">
                    Genius is thinking...
                </p>
            </div> 
      </div>  
    );
};

