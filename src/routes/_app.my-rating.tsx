import { createFileRoute } from "@tanstack/react-router";
import { Card } from "#/components/ui/Card";
import { Button } from "#/components/ui/Button";
import { ReportTable } from "#/components/ui/ReportTable";
import { api } from "#/lib/api";
import { formatDateTime } from "#/lib/format";
import { useApiData } from "#/lib/useApiData";

export const Route = createFileRoute("/_app/my-rating")({ component: MyRatingPage });

function MyRatingPage() {
  const { data, loading, error, refresh } = useApiData(api.ratings.my);
  const filled = Math.round(data?.summary.average ?? 0);
  return (
    <section className="report-page">
      <h1>Мой рейтинг</h1>
      <Card className="report-rating-card">
        {data && (
          <dl>
            <div>
              <dt>Средний балл</dt>
              <dd>
                {data.summary.count
                  ? data.summary.average.toLocaleString("ru-RU", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) + " из 5"
                  : "—"}
              </dd>
            </div>
            <div>
              <dt>Оценка</dt>
              <dd>
                <span aria-hidden="true">{"★".repeat(filled) + "☆".repeat(5 - filled)}</span>
              </dd>
            </div>
            <div>
              <dt>Количество</dt>
              <dd>{data.summary.count ? "Оценок: " + data.summary.count : "Оценок пока нет"}</dd>
            </div>
          </dl>
        )}
        <Button variant="secondary" disabled={loading} onClick={refresh}>
          Обновить
        </Button>
      </Card>
      {loading && <p role="status">Загрузка…</p>}
      {error && <p role="alert">{error}</p>}
      {data && (
        <>
          <ReportTable
            label="Полученные оценки"
            emptyMessage="Вас пока никто не оценил"
            columns={["Заявка", "От кого", "Оценка", "Комментарий", "Дата"]}
            rows={data.ratings.map((rating) => [
              "№" + rating.orderId,
              rating.fromNickname,
              rating.score,
              rating.comment || "—",
              formatDateTime(rating.createdAt),
            ])}
          />
        </>
      )}
    </section>
  );
}
