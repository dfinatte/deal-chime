import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SaleData {
  dataVenda: string;
  codigoImovel: string;
  enResponsavel: string;
  valorVenda: string;
  comissaoContrato: string;
  minhaComissao: string;
  valorPrevisto: string;
  valorRecebido: string;
  dataPrevRecebimento: string;
  dataRecebimento: string;
  observacoes: string;
}

interface SaleDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: SaleData) => void;
  onCancel: () => void;
}

const SaleDataDialog: React.FC<SaleDataDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}) => {
  const [saleData, setSaleData] = useState<SaleData>({
    dataVenda: new Date().toISOString().split('T')[0],
    codigoImovel: '',
    enResponsavel: '',
    valorVenda: '',
    comissaoContrato: '',
    minhaComissao: '',
    valorPrevisto: '',
    valorRecebido: '',
    dataPrevRecebimento: '',
    dataRecebimento: '',
    observacoes: '',
  });

  const handleConfirm = () => {
    onConfirm(saleData);
    setSaleData({
      dataVenda: new Date().toISOString().split('T')[0],
      codigoImovel: '',
      enResponsavel: '',
      valorVenda: '',
      comissaoContrato: '',
      minhaComissao: '',
      valorPrevisto: '',
      valorRecebido: '',
      dataPrevRecebimento: '',
      dataRecebimento: '',
      observacoes: '',
    });
  };

  const handleCancel = () => {
    onCancel();
    setSaleData({
      dataVenda: new Date().toISOString().split('T')[0],
      codigoImovel: '',
      enResponsavel: '',
      valorVenda: '',
      comissaoContrato: '',
      minhaComissao: '',
      valorPrevisto: '',
      valorRecebido: '',
      dataPrevRecebimento: '',
      dataRecebimento: '',
      observacoes: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dados da Venda</DialogTitle>
          <DialogDescription>
            Preencha os dados da venda realizada para este cliente
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataVenda">Data da Venda</Label>
              <Input
                id="dataVenda"
                type="date"
                value={saleData.dataVenda}
                onChange={(e) =>
                  setSaleData({ ...saleData, dataVenda: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codigoImovel">Código do Imóvel</Label>
              <Input
                id="codigoImovel"
                placeholder="Ex: AP-12345"
                value={saleData.codigoImovel}
                onChange={(e) =>
                  setSaleData({ ...saleData, codigoImovel: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="enResponsavel">EN Responsável</Label>
              <Input
                id="enResponsavel"
                placeholder="Nome do responsável"
                value={saleData.enResponsavel}
                onChange={(e) =>
                  setSaleData({ ...saleData, enResponsavel: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valorVenda">Valor da Venda (R$)</Label>
              <Input
                id="valorVenda"
                type="number"
                placeholder="0,00"
                value={saleData.valorVenda}
                onChange={(e) =>
                  setSaleData({ ...saleData, valorVenda: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="comissaoContrato">% Comissão Contrato</Label>
              <Input
                id="comissaoContrato"
                type="number"
                step="0.1"
                placeholder="0"
                value={saleData.comissaoContrato}
                onChange={(e) =>
                  setSaleData({ ...saleData, comissaoContrato: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minhaComissao">% Minha Comissão</Label>
              <Input
                id="minhaComissao"
                type="number"
                step="0.1"
                placeholder="0"
                value={saleData.minhaComissao}
                onChange={(e) =>
                  setSaleData({ ...saleData, minhaComissao: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valorPrevisto">Valor Previsto (R$)</Label>
              <Input
                id="valorPrevisto"
                type="number"
                placeholder="0,00"
                value={saleData.valorPrevisto}
                onChange={(e) =>
                  setSaleData({ ...saleData, valorPrevisto: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valorRecebido">Valor Recebido (R$)</Label>
              <Input
                id="valorRecebido"
                type="number"
                placeholder="0,00"
                value={saleData.valorRecebido}
                onChange={(e) =>
                  setSaleData({ ...saleData, valorRecebido: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataPrevRecebimento">Data Prev. Recebimento</Label>
              <Input
                id="dataPrevRecebimento"
                type="date"
                value={saleData.dataPrevRecebimento}
                onChange={(e) =>
                  setSaleData({ ...saleData, dataPrevRecebimento: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataRecebimento">Data Recebimento</Label>
              <Input
                id="dataRecebimento"
                type="date"
                value={saleData.dataRecebimento}
                onChange={(e) =>
                  setSaleData({ ...saleData, dataRecebimento: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Observações sobre a venda..."
              value={saleData.observacoes}
              onChange={(e) =>
                setSaleData({ ...saleData, observacoes: e.target.value })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>Confirmar Venda</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaleDataDialog;
