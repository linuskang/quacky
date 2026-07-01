export default function Loading() {
    return (
        <div className="flex flex-col items-center gap-2">
            <h1 className="text-sm font-bold text-muted-foreground">please wait...</h1>
            <span
                className="h-[34px] w-[34px] animate-spin rounded-full border-[3px]
                    border-[rgba(235,183,255,0.35)]
                    border-t-[#81ffff]
                    border-r-[#ebb7ff]
                    border-l-[#94DFFF]"
            />
        </div>
    );
}