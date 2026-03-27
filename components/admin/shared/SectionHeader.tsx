
import React from 'react';

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    rightElement?: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, rightElement }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{title}</h2>
                {subtitle && <p className="text-sm font-semibold text-slate-500 mt-1">{subtitle}</p>}
            </div>
            {rightElement && (
                <div className="shrink-0 w-full md:w-auto">
                    {rightElement}
                </div>
            )}
        </div>
    );
};

export default SectionHeader;
