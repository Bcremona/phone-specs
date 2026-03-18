export function generatePhoneDescription(phone) {
    const {
        brand, model, screen, price, cameras, storage, os,
        battery, highlight_features
    } = phone;

    const priceText = price ? `with a price of $${price}` : "";
    const cameraText = cameras ? `a main camera of ${cameras.rear.filter(camera => camera.type === "wide")[0].resolution_mp}MP` : "";
    const displayText = screen ? `${screen.size_inches}" ${screen.type} display` : "";
    const batteryText = battery ? `battery of ${battery.capacity_mAh}mAh` : "";

    const features = [cameraText, displayText, batteryText].join(", ");

    return `The ${brand} ${model} is a smartphone ${priceText} that stands out for offering ${features}. 
It comes with ${storage.internal_gb} of storage and runs ${os.name} ${os.version}, which makes it an option 
${price < 400 ? "accessible and competitive" : price < 800 ? "mid-range with excellent value for money" : "premium within its segment"} 
in the current market. ${highlight_features ? highlight_features.join(" ") : ""}`;
}