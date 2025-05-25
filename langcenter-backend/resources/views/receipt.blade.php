<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reçu d'inscription</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
        }
        .header h1 {
            margin: 0;
            color: #2c3e50;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0;
            color: #7f8c8d;
        }
        .receipt-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
        }
        .receipt-info div {
            flex: 1;
        }
        .section {
            margin-bottom: 20px;
        }
        .section h3 {
            background-color: #ecf0f1;
            padding: 8px;
            margin: 0 0 10px 0;
            border-left: 4px solid #3498db;
            font-size: 14px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 15px;
        }
        .info-item {
            padding: 5px 0;
        }
        .info-item strong {
            color: #2c3e50;
        }
        .payment-summary {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            border: 1px solid #dee2e6;
        }
        .total-amount {
            font-size: 18px;
            font-weight: bold;
            color: #27ae60;
            text-align: right;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 2px solid #27ae60;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #7f8c8d;
            border-top: 1px solid #bdc3c7;
            padding-top: 15px;
        }
        @media print {
            body { margin: 0; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>REÇU D'INSCRIPTION</h1>
        <p>École de Langues</p>
        <p>Adresse de l'école • Téléphone • Email</p>
    </div>

    <div class="receipt-info">
        <div>
            <strong>Reçu N°:</strong> {{ str_pad($etudiant->id, 6, '0', STR_PAD_LEFT) }}<br>
            <strong>Date:</strong> {{ $date_generation }}
        </div>
        <div style="text-align: right;">
            <strong>Année scolaire:</strong> {{ date('Y') }}-{{ date('Y') + 1 }}
        </div>
    </div>

    <div class="section">
        <h3>INFORMATIONS ÉTUDIANT</h3>
        <div class="info-grid">
            <div class="info-item">
                <strong>Nom complet:</strong> {{ $etudiant->prenom }} {{ $etudiant->nom }}
            </div>
            <div class="info-item">
                <strong>Date de naissance:</strong> {{ \Carbon\Carbon::parse($etudiant->date_naissance)->format('d/m/Y') }}
            </div>
            <div class="info-item">
                <strong>Email:</strong> {{ $etudiant->email ?? 'Non renseigné' }}
            </div>
            <div class="info-item">
                <strong>Téléphone:</strong> {{ $etudiant->telephone ?? 'Non renseigné' }}
            </div>
        </div>
        @if($etudiant->parent_)
        <div class="info-grid">
            <div class="info-item">
                <strong>Parent/Tuteur:</strong> {{ $etudiant->parent_->prenom }} {{ $etudiant->parent_->nom }}
            </div>
            <div class="info-item">
                <strong>Téléphone parent:</strong> {{ $etudiant->parent_->telephone ?? 'Non renseigné' }}
            </div>
        </div>
        @endif
    </div>

    @if($classe && $cours)
    <div class="section">
        <h3>INFORMATIONS COURS</h3>
        <div class="info-grid">
            <div class="info-item">
                <strong>Classe:</strong> {{ $classe->name }}
            </div>
            <div class="info-item">
                <strong>Cours:</strong> {{ $cours->title }}
            </div>
            @if($inscription)
            <div class="info-item">
                <strong>Prix négocié:</strong> {{ number_format($inscription->negotiated_price, 2) }} MAD
            </div>
            <div class="info-item">
                <strong>Date d'inscription:</strong> {{ \Carbon\Carbon::parse($inscription->created_at)->format('d/m/Y') }}
            </div>
            @endif
        </div>
    </div>
    @endif

    @if($payment)
    <div class="section">
        <h3>DÉTAILS DU PAIEMENT</h3>
        <div class="payment-summary">
            <div class="info-grid">
                <div class="info-item">
                    <strong>Montant payé:</strong> {{ number_format($payment->payment_amount, 2) }} MAD
                </div>
                <div class="info-item">
                    <strong>Mode de paiement:</strong> {{ ucfirst($payment->type ?? 'Espèces') }}
                </div>
                <div class="info-item">
                    <strong>Date de paiement:</strong> {{ \Carbon\Carbon::parse($payment->created_at)->format('d/m/Y H:i') }}
                </div>
                <div class="info-item">
                    <strong>Statut:</strong> 
                    @if($inscription && $payment->payment_amount >= $inscription->negotiated_price)
                        <span style="color: #27ae60;">Payé intégralement</span>
                    @else
                        <span style="color: #e74c3c;">Paiement partiel</span>
                    @endif
                </div>
            </div>
            
            @if($inscription)
            <div class="total-amount">
                Total à payer: {{ number_format($inscription->negotiated_price, 2) }} MAD
            </div>
            @endif
        </div>
    </div>
    @endif

    @if($etudiant->gratuit)
    <div class="section">
        <div class="payment-summary" style="background-color: #d4edda; border-color: #c3e6cb;">
            <div style="text-align: center; font-weight: bold; color: #155724;">
                ÉTUDIANT GRATUIT - AUCUN PAIEMENT REQUIS
            </div>
        </div>
    </div>
    @endif

    <div class="footer">
        <p>Ce reçu certifie l'inscription de l'étudiant(e) mentionné(e) ci-dessus.</p>
        <p>Pour toute question, veuillez nous contacter.</p>
        <p>Généré le {{ $date_generation }}</p>
    </div>
</body>
</html>