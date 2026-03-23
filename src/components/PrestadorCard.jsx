import PrimaryActionButton from "./PrimaryActionButton"
import WhatsAppButton from "./WhatsAppButton"

export default function PrestadorCard({
  prestador,
  index,
  local,
  formAvaliacao,
  onToggleFavorito,
  onRegistrarChamado,
  onFormAvaliacao,
  onEnviarAvaliacao,
  formatarData
}) {
  return (
    <article className="cardExpanded">
      <div className="cardHeader">
        <img
          alt={prestador.nome}
          src={`https://randomuser.me/api/portraits/men/${index + 10}.jpg`}
        />

        <div className="cardInfo">
          <div className="cardTitleRow">
            <div>
              <h4>{prestador.nome}</h4>
              <p>
                {prestador.tipo} - {prestador.cidade} - {prestador.distancia} km
              </p>
            </div>

            <button
              type="button"
              className={`favoriteButton ${prestador.favorito ? "active" : ""}`}
              onClick={() => onToggleFavorito(prestador.id)}
            >
              <span>{prestador.favorito ? "❤️ Salvo" : "🤍 Favoritar"}</span>
            </button>
          </div>

          <div className="ratingRow">
            <span>
              ⭐{" "}
              {prestador.resumoAvaliacao.total > 0
                ? `${prestador.resumoAvaliacao.media}/5`
                : "Sem avaliacoes"}
            </span>
            <span>💬 {prestador.resumoAvaliacao.total} comentarios</span>
          </div>
        </div>
      </div>

      <div className="cardActions">
        <WhatsAppButton
          href={`https://wa.me/55${prestador.telefone}?text=${encodeURIComponent(
            `Ola, preciso de ${prestador.tipo} em ${local}.`
          )}`}
        />
        <PrimaryActionButton
          onClick={() => onRegistrarChamado(prestador)}
          label="🚨 Registrar chamado"
        />
      </div>

      <div className="reviewBox">
        <h5>⭐ Avaliar prestador</h5>

        <div className="reviewForm">
          <select
            value={formAvaliacao?.nota || "5"}
            onChange={(e) => onFormAvaliacao(prestador.id, "nota", e.target.value)}
          >
            <option value="5">5 estrelas</option>
            <option value="4">4 estrelas</option>
            <option value="3">3 estrelas</option>
            <option value="2">2 estrelas</option>
            <option value="1">1 estrela</option>
          </select>

          <input
            type="text"
            placeholder="Conte como foi o atendimento"
            value={formAvaliacao?.comentario || ""}
            onChange={(e) => onFormAvaliacao(prestador.id, "comentario", e.target.value)}
          />

          <button type="button" onClick={() => onEnviarAvaliacao(prestador.id)}>
            📩 Enviar
          </button>
        </div>

        <div className="reviewList">
          {prestador.avaliacoesRecentes.length === 0 ? (
            <p className="emptyMini">Ainda nao existem comentarios.</p>
          ) : (
            prestador.avaliacoesRecentes.map((avaliacao) => (
              <div key={avaliacao.id} className="reviewItem">
                <strong>
                  {avaliacao.usuario} - {avaliacao.nota}/5
                </strong>
                <p>{avaliacao.comentario}</p>
                <span>{formatarData(avaliacao.data)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </article>
  )
}
