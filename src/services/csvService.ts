import { writeFileSync, mkdirSync, unlinkSync } from "fs";
import { join } from "path";

const TMP_DIR = join(process.cwd(), "tmp");

interface Item {
  name: string;
  purpose: string;
  licensePlate: string;
  quantity: number;
}

interface WebhookPayload {
  site: string;
  requestNo: string;
  requestDate: string;
  initiatorName: string;
  initiatorPosition: string;
  items: Item[];
}

function e(v: unknown): string {
  return `"${String(v ?? "").replace(/"/g, '""')}"`;
}

function row(...cells: unknown[]): string {
  return cells.map(e).join(";");
}

function buildCsv(payload: WebhookPayload): string {
  const { site, requestNo, requestDate, initiatorName, initiatorPosition, items } = payload;

  const lines: string[] = [
    // Шапка
    row("ООО «Ресурс»"),
    row(""),
    row(`ЗАЯВКА № ${requestNo}`),
    row("на приобретение ТМЦ"),
    row(""),
    row("Дата заказа:", requestDate),
    row("Подразделение / участок:", site),
    row("Инициатор заказа (ФИО, должность):", `${initiatorPosition} ${initiatorName}`),
    row(""),

    // Заголовок таблицы
    row("№", "Наименование товара / услуги", "Цель покупки", "Гос.номер ТС", "кол-во", "Цена за ед., руб."),

    // Строки товаров
    ...items.map((item, i) =>
      row(i + 1, item.name, item.purpose, item.licensePlate, item.quantity, "")
    ),

    // Подписи
    row(""),
    row("Заказчик (инициатор):", "", `${initiatorPosition} ${initiatorName}`),
    row(""),
    row("Согласовано:"),
    row(""),
    row("Главный механик:", "", "Коржавов А.Б."),
    row(""),
    row("Главный инженер:", "", "Топольницкий А.М."),
  ];

  return "\uFEFF" + lines.join("\r\n");
}

export function createCsv(payload: WebhookPayload): string {
  mkdirSync(TMP_DIR, { recursive: true });
  const filename = `Заявка ${payload.requestNo}.csv`;
  const filepath = join(TMP_DIR, filename);
  writeFileSync(filepath, buildCsv(payload), "utf-8");
  console.log(`[csv] saved → ${filepath}`);
  return filepath;
}

export function deleteCsv(filepath: string): void {
  try {
    unlinkSync(filepath);
    console.log(`[csv] deleted → ${filepath}`);
  } catch (e) {
    console.warn(`[csv] delete failed: ${e}`);
  }
}