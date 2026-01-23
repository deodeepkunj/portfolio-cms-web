"use client";

import React, {useEffect, useState} from "react";
import {useModal} from "@/hooks/useModal";
import {Modal} from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import {BannerForm} from "../../../../types";

export default function BannerCard() {
    const {isOpen, openModal, closeModal} = useModal();
    const [loading, setLoading] = useState(false);

    const [banner, setBanner] = useState<BannerForm>({
        badge: "",
        headlineLine1: "",
        headlineLine2: "",
        description: "",
        whatsappNumber: "",
        whatsappMessage: "",
        consultationLabel: "",
        consultationUrl: "",
        featuredTitle: "",
        featuredDescription: "",
    });

    const fetchBanner = async () => {
        try {
            const res = await fetch("/api/banner");
            if (!res.ok) return;

            const data = await res.json();

            setBanner({
                badge: data.badge ?? "",
                headlineLine1: data.headline?.line1 ?? "",
                headlineLine2: data.headline?.line2 ?? "",
                description: data.description ?? "",
                whatsappNumber: data.ctas?.[0]?.phone ?? "",
                whatsappMessage: data.ctas?.[0]?.message ?? "",
                consultationLabel: data.ctas?.[1]?.label ?? "",
                consultationUrl: data.ctas?.[1]?.url ?? "",
                featuredTitle: data.featured?.title ?? "",
                featuredDescription: data.featured?.description ?? "",
            });
        } catch (err) {
            console.error("Banner fetch error", err);
        }
    };

    useEffect(() => {
        fetchBanner();
    }, []);

    const handleSave = async () => {
        try {
            setLoading(true);

            const res = await fetch("/api/banner", {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    section: "banner",
                    data: {
                        badge: banner.badge,
                        headline: {
                            line1: banner.headlineLine1,
                            line2: banner.headlineLine2,
                        },
                        description: banner.description,
                        ctas: [
                            {
                                id: "whatsapp",
                                label: "Get Started",
                                action: "whatsapp",
                                phone: banner.whatsappNumber,
                                message: banner.whatsappMessage,
                            },
                            {
                                id: "consultation",
                                label: banner.consultationLabel,
                                action: "calendar",
                                url: banner.consultationUrl,
                            },
                        ],
                        featured: {
                            title: banner.featuredTitle,
                            description: banner.featuredDescription,
                        },
                    },
                }),
            });

            if (!res.ok) {
                console.error("Banner update failed", await res.json());
                return;
            }

            await fetchBanner();
            closeModal();
        } catch (err) {
            console.error("Banner update error", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                        Homepage Banner
                    </h4>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                        <Info label="Badge" value={banner.badge}/>
                        <Info label="Headline" value={`${banner.headlineLine1} ${banner.headlineLine2}`}/>
                        <Info label="Featured Title" value={banner.featuredTitle}/>
                        <Info label="Featured Description" value={banner.description}/>
                        <Info label="WhatsApp Number" value={banner.whatsappNumber}/>
                        <Info label="WhatsApp Message" value={banner.whatsappMessage}/>
                        <Info label="consultation Label" value={banner.consultationLabel}/>
                        <Info label="consultation URL" value={banner.consultationUrl}/>
                    </div>
                </div>

                <button
                    onClick={openModal}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
                >
                    <svg
                        className="fill-current"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                            fill=""
                        />
                    </svg>
                    Edit
                </button>
            </div>
            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[900px] m-4">
                {/* MODAL */}
                <div className="bg-white p-6 rounded-3xl">
                    <h4 className="mb-6 text-2xl font-semibold">Edit Banner</h4>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        <InputField label="Badge" value={banner.badge}
                                    onChange={(v) => setBanner({...banner, badge: v})}/>
                        <InputField label="Headline Line 1" value={banner.headlineLine1}
                                    onChange={(v) => setBanner({...banner, headlineLine1: v})}/>
                        <InputField label="Headline Line 2" value={banner.headlineLine2}
                                    onChange={(v) => setBanner({...banner, headlineLine2: v})}/>
                        <InputField label="Description" value={banner.description}
                                    onChange={(v) => setBanner({...banner, description: v})}/>

                        <InputField label="WhatsApp Number" value={banner.whatsappNumber} type="number"
                                    onChange={(v) => setBanner({...banner, whatsappNumber: v})}/>
                        <InputField label="WhatsApp Message" value={banner.whatsappMessage}
                                    onChange={(v) => setBanner({...banner, whatsappMessage: v})}/>

                        <InputField label="Consultation Label" value={banner.consultationLabel}
                                    onChange={(v) => setBanner({...banner, consultationLabel: v})}/>
                        <InputField label="Consultation URL" value={banner.consultationUrl}
                                    onChange={(v) => setBanner({...banner, consultationUrl: v})}/>

                        {/* FEATURED SECTION */}
                        <div className="lg:col-span-2">
                            <h5 className="mt-4 mb-2 font-semibold">Featured Section</h5>
                            <InputField
                                label="Featured Title"
                                value={banner.featuredTitle}
                                onChange={(v) => setBanner({...banner, featuredTitle: v})}
                            />
                            <InputField
                                label="Featured Description"
                                value={banner.featuredDescription}
                                onChange={(v) => setBanner({...banner, featuredDescription: v})}
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button variant="outline" size="sm" onClick={closeModal}>
                            Close
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

function Info({label, value}: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-sm font-medium dark:text-gray-400">{value || "-"}</p>
        </div>
    );
}

function InputField({
                        label,
                        value,
                        onChange,
                        type
                    }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
}) {
    return (
        <div>
            <Label>{label}</Label>
            <Input value={value} type={type} onChange={(e) => onChange(e.target.value)}/>
        </div>
    );
}