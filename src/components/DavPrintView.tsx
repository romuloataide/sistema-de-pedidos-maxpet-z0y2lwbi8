import { formatCurrency, formatDate, formatDocument } from '@/lib/utils'

export function DavPrintView({
  order,
  client,
  settings,
  seller,
  products,
  davConfig,
  davData,
  itemsDavData,
}: any) {
  if (!davConfig) return null

  const dData = davData || { delivery: {}, commercial: {}, totals: {} }
  const activeBlocks = davConfig.activeBlocks || {}
  const columns = davConfig.columns || {}
  const texts = davConfig.texts || {}
  const isThermal = davConfig.layout?.size === 'thermal'

  return (
    <div
      className={`hidden print:block fixed inset-0 bg-white z-[9999] text-black font-sans leading-tight ${isThermal ? 'w-[80mm] p-2 text-[9px]' : 'p-8 text-[11px]'}`}
    >
      {/* Cabeçalho */}
      {activeBlocks.header && (
        <div
          className={`flex ${isThermal ? 'flex-col gap-2' : 'justify-between'} border-2 border-black p-2 mb-2`}
        >
          <div
            className={`${isThermal ? 'w-full text-center' : 'w-1/4'} flex items-center justify-center`}
          >
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} className="max-h-16 object-contain" alt="Logo" />
            ) : (
              <span className="font-black italic text-lg">MaxPET</span>
            )}
          </div>
          <div
            className={`${isThermal ? 'w-full' : 'w-1/2'} text-center flex flex-col justify-center`}
          >
            <h1 className="font-bold text-sm uppercase">{settings?.companyName}</h1>
            {settings?.address && <p>{settings.address}</p>}
            <p>
              CNPJ: {formatDocument(settings?.document || '')}{' '}
              {settings?.phone ? `| Tel: ${settings.phone}` : ''}
            </p>
          </div>
          <div
            className={`${isThermal ? 'w-full border-t-2 mt-2 pt-2' : 'w-1/4 border-l-2 pl-2'} text-center border-black flex flex-col justify-center`}
          >
            <h2 className="font-bold text-[10px] uppercase mb-1">Documento Auxiliar de Venda</h2>
            <p className="font-black text-lg">Nº {order?.shortId}</p>
            <p>Emissão: {order?.createdAt ? formatDate(order.createdAt) : ''}</p>
          </div>
        </div>
      )}

      {/* Cliente */}
      {activeBlocks.client && (
        <div className="border-2 border-black mb-2">
          <div className="bg-gray-200 font-bold px-2 py-0.5 border-b-2 border-black uppercase text-[10px]">
            Dados do Cliente
          </div>
          <div className={`p-2 grid ${isThermal ? 'grid-cols-1' : 'grid-cols-2'} gap-x-4 gap-y-1`}>
            {client?.name && (
              <p>
                <strong>Razão Social:</strong> {client.name}
              </p>
            )}
            {client?.document && (
              <p>
                <strong>CNPJ/CPF:</strong> {formatDocument(client.document)}
              </p>
            )}
            {client?.phone && (
              <p>
                <strong>Telefone:</strong> {client.phone}
              </p>
            )}
            {client?.email && (
              <p>
                <strong>E-mail:</strong> {client.email}
              </p>
            )}
            {client?.address && (
              <p className="col-span-1 sm:col-span-2">
                <strong>Endereço:</strong> {client.address}, {client.neighborhood} - {client.city}/
                {client.state}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Entrega */}
      {activeBlocks.delivery &&
        (dData.delivery?.carrier || dData.delivery?.address || dData.delivery?.freightType) && (
          <div className="border-2 border-black mb-2">
            <div className="bg-gray-200 font-bold px-2 py-0.5 border-b-2 border-black uppercase text-[10px]">
              Dados de Entrega
            </div>
            <div
              className={`p-2 grid ${isThermal ? 'grid-cols-1' : 'grid-cols-2'} gap-x-4 gap-y-1`}
            >
              {dData.delivery.carrier && (
                <p>
                  <strong>Transportadora:</strong> {dData.delivery.carrier}
                </p>
              )}
              {dData.delivery.freightType && (
                <p>
                  <strong>Tipo de Frete:</strong> {dData.delivery.freightType}
                </p>
              )}
              {dData.delivery.address && (
                <p className="col-span-1 sm:col-span-2">
                  <strong>Endereço Entrega:</strong> {dData.delivery.address}
                </p>
              )}
            </div>
          </div>
        )}

      {/* Itens */}
      {activeBlocks.products && (
        <div className="mb-2">
          <table className="w-full border-collapse border-2 border-black">
            <thead>
              <tr className="bg-gray-200 border-b-2 border-black text-[9px] uppercase">
                {columns.code && (
                  <th className="border-r border-black px-1 py-0.5 text-left">Cód</th>
                )}
                {columns.description && (
                  <th className="border-r border-black px-1 py-0.5 text-left">Descrição</th>
                )}
                {columns.quantity && (
                  <th className="border-r border-black px-1 py-0.5 text-right">Qtd</th>
                )}
                {columns.unitPrice && (
                  <th className="border-r border-black px-1 py-0.5 text-right">Unit</th>
                )}
                {columns.ipi && !isThermal && (
                  <th className="border-r border-black px-1 py-0.5 text-right">% IPI</th>
                )}
                {columns.icms && !isThermal && (
                  <th className="border-r border-black px-1 py-0.5 text-right">% ICMS</th>
                )}
                {columns.ncm && !isThermal && (
                  <th className="border-r border-black px-1 py-0.5 text-center">NCM</th>
                )}
                {columns.total && <th className="px-1 py-0.5 text-right">Total</th>}
              </tr>
            </thead>
            <tbody>
              {order?.items?.map((item: any, i: number) => {
                const p = products?.find((x: any) => x.id === item.productId)
                const iData = itemsDavData?.[item.id] || {}
                return (
                  <tr key={i} className="border-b border-black last:border-b-0 text-[10px]">
                    {columns.code && (
                      <td className="border-r border-black px-1 py-1">
                        {String(p?.code || '').padStart(4, '0')}
                      </td>
                    )}
                    {columns.description && (
                      <td className="border-r border-black px-1 py-1">
                        {p?.name} {p?.size}
                      </td>
                    )}
                    {columns.quantity && (
                      <td className="border-r border-black px-1 py-1 text-right">
                        {item.quantity}
                      </td>
                    )}
                    {columns.unitPrice && (
                      <td className="border-r border-black px-1 py-1 text-right">
                        {formatCurrency(item.unitPrice)}
                      </td>
                    )}
                    {columns.ipi && !isThermal && (
                      <td className="border-r border-black px-1 py-1 text-right">
                        {iData.ipiPercentage ? iData.ipiPercentage + '%' : '-'}
                      </td>
                    )}
                    {columns.icms && !isThermal && (
                      <td className="border-r border-black px-1 py-1 text-right">
                        {iData.icmsPercentage ? iData.icmsPercentage + '%' : '-'}
                      </td>
                    )}
                    {columns.ncm && !isThermal && (
                      <td className="border-r border-black px-1 py-1 text-center">
                        {iData.ncm || '-'}
                      </td>
                    )}
                    {columns.total && (
                      <td className="px-1 py-1 text-right font-bold">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Condições e Observações */}
      <div className={`grid ${isThermal ? 'grid-cols-1' : 'grid-cols-2'} gap-2 mb-2`}>
        {activeBlocks.commercial && (
          <div className="border-2 border-black">
            <div className="bg-gray-200 font-bold px-2 py-0.5 border-b-2 border-black uppercase text-[10px]">
              Condições Comerciais
            </div>
            <div className="p-2 space-y-1">
              <p>
                <strong>Vendedor:</strong> {seller?.name || '-'}
              </p>
              {order?.paymentMethod && (
                <p>
                  <strong>Pagamento:</strong> {order.paymentMethod}
                </p>
              )}
              {dData.commercial?.paymentCondition && (
                <p>
                  <strong>Prazo:</strong> {dData.commercial.paymentCondition}
                </p>
              )}
              {dData.commercial?.customerOrderNumber && (
                <p>
                  <strong>Pedido Cliente (OC):</strong> {dData.commercial.customerOrderNumber}
                </p>
              )}
            </div>
          </div>
        )}

        {activeBlocks.observations && (
          <div className="border-2 border-black">
            <div className="bg-gray-200 font-bold px-2 py-0.5 border-b-2 border-black uppercase text-[10px]">
              Observações
            </div>
            <div className="p-2 space-y-1">
              {order?.notes && <p>{order.notes}</p>}
              {texts.fiscalObservation && (
                <p className="italic text-gray-600 leading-tight">{texts.fiscalObservation}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Totais */}
      {activeBlocks.totals && (
        <div
          className={`border-2 border-black flex ${isThermal ? 'justify-center' : 'justify-end'}`}
        >
          <table className={`${isThermal ? 'w-full' : 'w-1/2'} text-right`}>
            <tbody>
              {dData.commercial?.discount > 0 && (
                <tr>
                  <td className="px-2 py-0.5">Desconto:</td>
                  <td className="px-2 py-0.5 text-red-600">
                    -{formatCurrency(dData.commercial.discount)}
                  </td>
                </tr>
              )}
              {dData.commercial?.addition > 0 && (
                <tr>
                  <td className="px-2 py-0.5">Acréscimo:</td>
                  <td className="px-2 py-0.5">{formatCurrency(dData.commercial.addition)}</td>
                </tr>
              )}
              {dData.totals?.freight > 0 && (
                <tr>
                  <td className="px-2 py-0.5">Frete:</td>
                  <td className="px-2 py-0.5">{formatCurrency(dData.totals.freight)}</td>
                </tr>
              )}
              {dData.totals?.ipi > 0 && (
                <tr>
                  <td className="px-2 py-0.5">Valor IPI:</td>
                  <td className="px-2 py-0.5">{formatCurrency(dData.totals.ipi)}</td>
                </tr>
              )}
              {dData.totals?.icmsSt > 0 && (
                <tr>
                  <td className="px-2 py-0.5">Valor ICMS ST:</td>
                  <td className="px-2 py-0.5">{formatCurrency(dData.totals.icmsSt)}</td>
                </tr>
              )}
              <tr className="border-t-2 border-black bg-gray-200 font-black text-sm">
                <td className="px-2 py-1 uppercase">Total a Pagar:</td>
                <td className="px-2 py-1">{formatCurrency(order?.total || 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Assinaturas */}
      {!isThermal && (
        <div className="mt-8 flex justify-around text-center pt-8 text-[10px]">
          <div className="w-64 border-t border-black pt-1">
            <p className="font-bold">{client?.name}</p>
            <p>Assinatura do Cliente</p>
          </div>
          <div className="w-64 border-t border-black pt-1">
            <p className="font-bold">{seller?.name || settings?.companyName}</p>
            <p>Assinatura Emitente</p>
          </div>
        </div>
      )}

      {texts.footer && (
        <div className="mt-4 text-center italic text-gray-500 text-[9px] border-t border-dashed pt-2">
          {texts.footer}
        </div>
      )}
    </div>
  )
}
