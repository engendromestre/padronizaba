"use client";

import { Eye, FileText, MoreHorizontal, Pencil, Send, Trash2, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type ActionMenuOption = "view" | "edit" | "delete" | "resendInvite" | "report";

interface ActionMenuProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onResendInvite?: () => void;
  onReport?: () => void;
  enabledActions?: ActionMenuOption[];
  className?: string;
}

export function DataTableActionMenu({
  onView,
  onEdit,
  onDelete,
  onResendInvite,
  onReport,
  enabledActions = ["view", "edit", "delete"],
  className = "",
}: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
  );
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Atualiza isMobile ao redimensionar
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // useLayoutEffect: roda antes do browser pintar — calcula posição sem flash
  useLayoutEffect(() => {
    if (open && !isMobile && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 192, // 192px = w-48
      });
    } else {
      setDropdownPos(null);
    }
  }, [open, isMobile]);

  // Fecha ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedButton = buttonRef.current?.contains(target);
      const clickedMenu = menuRef.current?.contains(target);
      if (!clickedButton && !clickedMenu) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Fecha ao rolar (desktop)
  useEffect(() => {
    if (open && !isMobile) {
      const handleScroll = () => setOpen(false);
      window.addEventListener("scroll", handleScroll, true);
      return () => window.removeEventListener("scroll", handleScroll, true);
    }
  }, [open, isMobile]);

  // Bloqueia scroll no mobile
  useEffect(() => {
    document.body.style.overflow = (open && isMobile) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open, isMobile]);

  const allActions = [
    { key: "view" as const, label: "Visualizar Registro", icon: Eye, action: onView },
    { key: "edit" as const, label: "Editar Informações", icon: Pencil, action: onEdit },
    { key: "resendInvite" as const, label: "Reenviar Convite", icon: Send, action: onResendInvite },
    { key: "report" as const, label: "Exportar Relatório", icon: FileText, action: onReport },
  ];

  const visibleActions = allActions.filter(
    (item) => enabledActions.includes(item.key) && !!item.action
  );

  // ================================================================
  // 💻 DESKTOP — Portal com posição calculada antes do paint
  // ================================================================
  const desktopDropdown = (open && !isMobile && dropdownPos) ? createPortal(
    <div
      ref={menuRef}
      style={{ top: dropdownPos.top, left: dropdownPos.left }}
      className="absolute w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-9999 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right"
    >
      {visibleActions.map((item, index) => (
        <button
          key={index}
          onClick={(e) => {
            e.stopPropagation();
            item.action?.();
            setOpen(false);
          }}
          className="w-full px-4 py-2.5 text-left flex items-center gap-2.5 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
        >
          <item.icon size={15} className="text-gray-400" />
          {item.label.replace(" Registro", "").replace(" Informações", "").replace(" Exportar ", "")}
        </button>
      ))}

      {onDelete && enabledActions.includes("delete") && (
        <>
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
              setOpen(false);
            }}
            className="w-full px-4 py-2.5 text-left flex items-center gap-2.5 hover:bg-red-50 text-xs font-bold text-primary transition-colors cursor-pointer"
          >
            <Trash2 size={15} className="text-primary-300" />
            Excluir Registro
          </button>
        </>
      )}
    </div>,
    document.body
  ) : null;

  // ================================================================
  // 📱 MOBILE — Bottom sheet via Portal
  // ================================================================
  const mobileSheet = (open && isMobile) ? createPortal(
    <>
      <div
        onClick={() => setOpen(false)}
        className="fixed inset-0 bg-black/40 z-9998 animate-in fade-in duration-200"
        style={{ touchAction: "none" }}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl border-t border-gray-100 shadow-2xl z-9999 p-5 pb-8 space-y-4 animate-in slide-in-from-bottom duration-300 outline-none"
      >
        <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-1" onClick={() => setOpen(false)} />

        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Opções do Registro
            </h3>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Selecione a operação que deseja realizar
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2 pt-1">
          {visibleActions.map((item, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                item.action?.();
                setOpen(false);
              }}
              className="w-full px-4 py-3 bg-gray-50/60 active:bg-gray-100/80 rounded-xl text-left flex items-center gap-3 text-sm font-semibold text-gray-700 transition-all cursor-pointer border border-gray-100/20"
            >
              <div className="p-2 bg-white rounded-lg shadow-3xs border border-gray-100">
                <item.icon size={16} className="text-gray-500" />
              </div>
              <span>{item.label}</span>
            </button>
          ))}

          {onDelete && enabledActions.includes("delete") && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
                setOpen(false);
              }}
              className="w-full mt-3 px-4 py-3 bg-red-50/40 active:bg-red-50 rounded-xl text-left flex items-center gap-3 text-sm font-bold text-primary transition-all cursor-pointer border border-red-100/40"
            >
              <div className="p-2 bg-white rounded-lg shadow-3xs border border-red-100">
                <Trash2 size={16} className="text-primary" />
              </div>
              <span>Excluir Registro Permanente</span>
            </button>
          )}
        </div>
      </div>
    </>,
    document.body
  ) : null;

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="p-2.5 hover:bg-gray-100 rounded-full transition-all duration-150 cursor-pointer text-gray-400 hover:text-gray-600 active:scale-90 flex items-center justify-center focus:outline-none"
      >
        <MoreHorizontal size={20} />
      </button>

      {desktopDropdown}
      {mobileSheet}
    </div>
  );
}