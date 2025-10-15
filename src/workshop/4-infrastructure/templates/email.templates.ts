import { BudgetEmailData } from '../../3-domain/interfaces/notification.interface';

export class EmailTemplates {
  static budgetReady(data: BudgetEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Orçamento Disponível</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; margin: 10px 5px; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .btn-approve { background: #28a745; color: white; }
        .btn-reject { background: #dc3545; color: white; }
        .btn-view { background: #17a2b8; color: white; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .budget-info { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #007bff; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔧 ${data.companyName}</h1>
            <h2>Orçamento Pronto!</h2>
        </div>
        
        <div class="content">
            <p>Olá <strong>${data.customerName}</strong>,</p>
            
            <p>Seu orçamento está pronto! Confira os detalhes abaixo:</p>
            
            <div class="budget-info">
                <h3>📋 Orçamento #${data.orderNumber}</h3>
                <p><strong>Valor Total:</strong> R$ ${data.total.toFixed(2)}</p>
                <p><strong>Válido até:</strong> ${data.validUntil.toLocaleDateString('pt-BR')}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${data.viewLink}" class="button btn-view">👁️ Visualizar Orçamento</a>
                <br>
                <a href="${data.approveLink}" class="button btn-approve">✅ Aprovar</a>
                <a href="${data.rejectLink}" class="button btn-reject">❌ Rejeitar</a>
            </div>
            
            <p><strong>Precisa de ajuda?</strong></p>
            <p>Entre em contato conosco:</p>
            <p>📞 ${data.companyPhone} | 📧 ${data.companyEmail}</p>
        </div>
        
        <div class="footer">
            <p>Este é um email automático. Não é necessário responder.</p>
            <p>&copy; ${new Date().getFullYear()} ${data.companyName} - Todos os direitos reservados</p>
        </div>
    </div>
</body>
</html>`;
  }

  static budgetApproved(data: BudgetEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Orçamento Aprovado</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .success-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #28a745; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔧 ${data.companyName}</h1>
            <h2>✅ Orçamento Aprovado!</h2>
        </div>
        
        <div class="content">
            <p>Olá <strong>${data.customerName}</strong>,</p>
            
            <div class="success-box">
                <h3>🎉 Seu orçamento foi aprovado com sucesso!</h3>
                <p><strong>Orçamento:</strong> #${data.orderNumber}</p>
                <p><strong>Valor:</strong> R$ ${data.total.toFixed(2)}</p>
            </div>
            
            <p><strong>Próximos passos:</strong></p>
            <ul>
                <li>Nossa equipe iniciará o serviço em breve</li>
                <li>Você receberá atualizações sobre o progresso</li>
                <li>Entraremos em contato para agendamento se necessário</li>
            </ul>
            
            <p>📞 ${data.companyPhone} | 📧 ${data.companyEmail}</p>
        </div>
        
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${data.companyName}</p>
        </div>
    </div>
</body>
</html>`;
  }

  static budgetRejected(data: BudgetEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Orçamento Rejeitado</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔧 ${data.companyName}</h1>
            <h2>Orçamento Rejeitado</h2>
        </div>
        
        <div class="content">
            <p>Olá <strong>${data.customerName}</strong>,</p>
            
            <div class="info-box">
                <p>Recebemos sua resposta sobre o orçamento <strong>#${data.orderNumber}</strong>.</p>
            </div>
            
            <p><strong>Entendemos sua decisão.</strong></p>
            <p>Se desejar conversar sobre outras opções ou renegociar o valor, nossa equipe está à disposição.</p>
            
            <p><strong>Entre em contato:</strong></p>
            <p>📞 ${data.companyPhone} | 📧 ${data.companyEmail}</p>
            
            <p>Obrigado pela confiança!</p>
        </div>
        
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${data.companyName}</p>
        </div>
    </div>
</body>
</html>`;
  }

  static serviceOrderStatus(data: {
    customerName: string;
    orderNumber: string;
    vehicleInfo: string;
    status: string;
    message: string;
    companyName: string;
    companyPhone: string;
    companyEmail: string;
  }): string {
    const statusColors = {
      IN_DIAGNOSIS: '#007bff',
      AWAITING_APPROVAL: '#ffc107',
      IN_EXECUTION: '#28a745',
      FINISHED: '#17a2b8',
      DELIVERED: '#6f42c1',
    };

    const statusIcons = {
      IN_DIAGNOSIS: '🔍',
      AWAITING_APPROVAL: '⏳',
      IN_EXECUTION: '🔧',
      FINISHED: '✅',
      DELIVERED: '🚗',
    };

    const color = statusColors[data.status] || '#6c757d';
    const icon = statusIcons[data.status] || '📋';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Atualização da Ordem de Serviço</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${color}; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .status-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid ${color}; }
        .vehicle-info { background: #e9ecef; padding: 10px; margin: 10px 0; border-radius: 5px; }
        .contact-info { background: #d4edda; padding: 15px; margin: 15px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔧 ${data.companyName}</h1>
            <h2>${icon} Atualização da Ordem de Serviço</h2>
        </div>
        
        <div class="content">
            <p>Olá <strong>${data.customerName}</strong>,</p>
            
            <div class="status-box">
                <h3>📋 Ordem de Serviço: ${data.orderNumber}</h3>
                <div class="vehicle-info">
                    <strong>Veículo:</strong> ${data.vehicleInfo}
                </div>
                <p><strong>Status Atual:</strong> <span style="color: ${color}; font-weight: bold;">${data.status}</span></p>
                <p><strong>Informação:</strong> ${data.message}</p>
            </div>
            
            <div class="contact-info">
                <h4>📞 Precisa de mais informações?</h4>
                <p><strong>Telefone:</strong> ${data.companyPhone}</p>
                <p><strong>Email:</strong> ${data.companyEmail}</p>
            </div>
            
            <p>Nossa equipe está trabalhando para oferecer o melhor serviço possível!</p>
        </div>
        
        <div class="footer">
            <p>Este é um email automático. Não é necessário responder.</p>
            <p>&copy; ${new Date().getFullYear()} ${data.companyName} - Todos os direitos reservados</p>
        </div>
    </div>
</body>
</html>`;
  }
}
