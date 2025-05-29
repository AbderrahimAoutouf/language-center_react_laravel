<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reçu d'inscription - Double</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 8px;
            margin: 0;
            padding: 10px;
            color: #000;
            line-height: 1.1;
        }
        
        .page-container {
            max-width: 21cm;
            margin: 0 auto;
        }
        
        .receipt {
            width: 100%;
            border: 1px solid #000;
            padding: 8px;
            margin-bottom: 10px;
            page-break-inside: avoid;
        }
        
        .header {
            text-align: center;
            margin-bottom: 8px;
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
        }
        
        .header h1 {
            margin: 0 0 3px 0;
            font-size: 11px;
            font-weight: bold;
        }
        
        .header p {
            margin: 1px 0;
            font-size: 7px;
        }
        
        .receipt-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
            font-size: 7px;
        }
        
        .main-content {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 6px;
            margin-bottom: 6px;
        }
        
        .section {
            border: 1px solid #ccc;
            padding: 4px;
        }
        
        .section-title {
            font-weight: bold;
            font-size: 8px;
            margin-bottom: 3px;
            text-decoration: underline;
        }
        
        .info-line {
            margin-bottom: 1px;
            font-size: 7px;
        }
        
        .info-line strong {
            font-weight: bold;
        }
        
        .course-payment {
            grid-column: span 1;
        }
        
        .payment-summary {
            background-color: #f5f5f5;
            padding: 3px;
            text-align: center;
            font-size: 7px;
            margin-top: 3px;
        }
        
        .paid-status {
            font-weight: bold;
            font-size: 7px;
            padding: 2px 4px;
            background-color: #e9ecef;
            border: 1px solid #999;
        }
        
        .signatures {
            display: flex;
            justify-content: space-around;
            margin-top: 8px;
            gap: 5px;
        }
        
        .signature-box {
            text-align: center;
            font-size: 6px;
            flex: 1;
        }
        
        .signature-line {
            border-top: 1px solid #000;
            margin-top: 12px;
            padding-top: 1px;
        }
        
        .footer {
            text-align: center;
            font-size: 6px;
            margin-top: 6px;
            border-top: 1px solid #000;
            padding-top: 4px;
        }
        
        @media print {
            body { 
                margin: 0; 
                padding: 5px;
            }
            .receipt {
                border: 1px solid #000;
                margin-bottom: 5px;
            }
            .page-container {
                max-width: none;
            }
        }
    </style>
</head>
<body>
    <div class="page-container">
        <!-- First Receipt -->
        <div class="receipt">
            <div class="header">
                <h1>REÇU D'INSCRIPTION</h1>
                <p><strong>English Castle</strong></p>
                <p>N° 19, Immeuble Icenter, Bouskoura • Tél: 05223-20900</p>
            </div>

            <div class="receipt-info">
                <div><strong>Reçu N°:</strong> {{ str_pad($etudiant->id, 6, '0', STR_PAD_LEFT) }}</div>
                <div><strong>Date:</strong> {{ $date_generation }}</div>
                <div><strong>Année:</strong> {{ date('Y') }}-{{ date('Y') + 1 }}</div>
            </div>

            <div class="main-content">
                <div class="section">
                    <div class="section-title">ÉTUDIANT</div>
                    <div class="info-line"><strong>Nom:</strong> {{ $etudiant->prenom }} {{ $etudiant->nom }}</div>
                    <div class="info-line"><strong>Né:</strong> {{ \Carbon\Carbon::parse($etudiant->date_naissance)->format('d/m/Y') }}</div>
                    <div class="info-line"><strong>Âge:</strong> {{ \Carbon\Carbon::parse($etudiant->date_naissance)->age }} ans</div>
                    <div class="info-line"><strong>Genre:</strong> {{ $etudiant->sexe == 'male' ? 'M' : 'F' }}</div>
                    @if($etudiant->email)
                        <div class="info-line"><strong>Email:</strong> {{ $etudiant->email }}</div>
                    @endif
                    @if($etudiant->telephone)
                        <div class="info-line"><strong>Tél:</strong> {{ $etudiant->telephone }}</div>
                    @endif
                    <div class="info-line"><strong>Photo:</strong> {{ $etudiant->photo_authorized ? 'Oui' : 'Non' }}</div>
                </div>

                @if($etudiant->parent_)
                    <div class="section">
                        <div class="section-title">TUTEUR</div>
                        <div class="info-line"><strong>Nom:</strong> {{ $etudiant->parent_->prenom }} {{ $etudiant->parent_->nom }}</div>
                        @if($etudiant->parent_->relationship)
                            <div class="info-line"><strong>Relation:</strong> {{ $etudiant->parent_->relationship }}</div>
                        @endif
                        @if($etudiant->parent_->telephone)
                            <div class="info-line"><strong>Tél:</strong> {{ $etudiant->parent_->telephone }}</div>
                        @endif
                        @if($etudiant->parent_->email)
                            <div class="info-line"><strong>Email:</strong> {{ $etudiant->parent_->email }}</div>
                        @endif
                        @if($etudiant->parent_->cin)
                            <div class="info-line"><strong>CIN:</strong> {{ $etudiant->parent_->cin }}</div>
                        @endif
                    </div>
                @endif

                <div class="section course-payment">
                    <div class="section-title">COURS & PAIEMENT</div>
                    @if($cours)
                        <div class="info-line"><strong>Cours:</strong> {{ $cours->title }}</div>
                        @if($cours->price)
                            <div class="info-line"><strong>Prix:</strong> {{ number_format($cours->price, 2) }} MAD</div>
                        @endif
                        @if($cours->duration)
                            <div class="info-line"><strong>Durée:</strong> {{ $cours->duration }}</div>
                        @endif
                    @endif

                    @if($etudiant->gratuit)
                        <div class="payment-summary">
                            <div class="paid-status">ÉTUDIANT GRATUIT</div>
                        </div>
                    @else
                        @php
                            $coursPrice = $cours->price ?? 0;
                            $avancePaid = $etudiant->avance ?? 0;
                            $remaining = $coursPrice - $avancePaid;
                            $isFullyPaid = $remaining <= 0;
                        @endphp
                        
                        <div class="info-line"><strong>Avance:</strong> {{ number_format($avancePaid, 2) }} MAD</div>
                        <div class="payment-summary">
                            <div class="paid-status">
                                {{ $isFullyPaid ? 'PAYÉ' : 'PARTIEL' }}
                            </div>
                            @if(!$isFullyPaid)
                                <div style="font-size: 6px; margin-top: 2px;">
                                    Reste: {{ number_format($remaining, 2) }} MAD
                                </div>
                            @endif
                        </div>
                    @endif
                </div>
            </div>

            <div class="signatures">
                <div class="signature-box">
                    <div>Étudiant</div>
                    <div class="signature-line"></div>
                </div>
                <div class="signature-box">
                    <div>Cachet</div>
                    <div class="signature-line"></div>
                </div>
                <div class="signature-box">
                    <div>Administration</div>
                    <div class="signature-line"></div>
                </div>
            </div>

            <div class="footer">
                <p>Reçu d'inscription • {{ $date_generation }}</p>
            </div>
        </div>

        <!-- Second Receipt (Identical) -->
        <div class="receipt">
            <div class="header">
                <h1>REÇU D'INSCRIPTION</h1>
                <p><strong>English Castle</strong></p>
                <p>N° 19, Immeuble Icenter, Bouskoura • Tél: 05223-20900</p>
            </div>

            <div class="receipt-info">
                <div><strong>Reçu N°:</strong> {{ str_pad($etudiant->id, 6, '0', STR_PAD_LEFT) }}</div>
                <div><strong>Date:</strong> {{ $date_generation }}</div>
                <div><strong>Année:</strong> {{ date('Y') }}-{{ date('Y') + 1 }}</div>
            </div>

            <div class="main-content">
                <div class="section">
                    <div class="section-title">ÉTUDIANT</div>
                    <div class="info-line"><strong>Nom:</strong> {{ $etudiant->prenom }} {{ $etudiant->nom }}</div>
                    <div class="info-line"><strong>Né:</strong> {{ \Carbon\Carbon::parse($etudiant->date_naissance)->format('d/m/Y') }}</div>
                    <div class="info-line"><strong>Âge:</strong> {{ \Carbon\Carbon::parse($etudiant->date_naissance)->age }} ans</div>
                    <div class="info-line"><strong>Genre:</strong> {{ $etudiant->sexe == 'male' ? 'M' : 'F' }}</div>
                    @if($etudiant->email)
                        <div class="info-line"><strong>Email:</strong> {{ $etudiant->email }}</div>
                    @endif
                    @if($etudiant->telephone)
                        <div class="info-line"><strong>Tél:</strong> {{ $etudiant->telephone }}</div>
                    @endif
                    <div class="info-line"><strong>Photo:</strong> {{ $etudiant->photo_authorized ? 'Oui' : 'Non' }}</div>
                </div>

                @if($etudiant->parent_)
                    <div class="section">
                        <div class="section-title">TUTEUR</div>
                        <div class="info-line"><strong>Nom:</strong> {{ $etudiant->parent_->prenom }} {{ $etudiant->parent_->nom }}</div>
                        @if($etudiant->parent_->relationship)
                            <div class="info-line"><strong>Relation:</strong> {{ $etudiant->parent_->relationship }}</div>
                        @endif
                        @if($etudiant->parent_->telephone)
                            <div class="info-line"><strong>Tél:</strong> {{ $etudiant->parent_->telephone }}</div>
                        @endif
                        @if($etudiant->parent_->email)
                            <div class="info-line"><strong>Email:</strong> {{ $etudiant->parent_->email }}</div>
                        @endif
                        @if($etudiant->parent_->cin)
                            <div class="info-line"><strong>CIN:</strong> {{ $etudiant->parent_->cin }}</div>
                        @endif
                    </div>
                @endif

                <div class="section course-payment">
                    <div class="section-title">COURS & PAIEMENT</div>
                    @if($cours)
                        <div class="info-line"><strong>Cours:</strong> {{ $cours->title }}</div>
                        @if($cours->price)
                            <div class="info-line"><strong>Prix:</strong> {{ number_format($cours->price, 2) }} MAD</div>
                        @endif
                        @if($cours->duration)
                            <div class="info-line"><strong>Durée:</strong> {{ $cours->duration }}</div>
                        @endif
                    @endif

                    @if($etudiant->gratuit)
                        <div class="payment-summary">
                            <div class="paid-status">ÉTUDIANT GRATUIT</div>
                        </div>
                    @else
                        @php
                            $coursPrice = $cours->price ?? 0;
                            $avancePaid = $etudiant->avance ?? 0;
                            $remaining = $coursPrice - $avancePaid;
                            $isFullyPaid = $remaining <= 0;
                        @endphp
                        
                        <div class="info-line"><strong>Avance:</strong> {{ number_format($avancePaid, 2) }} MAD</div>
                        <div class="payment-summary">
                            <div class="paid-status">
                                {{ $isFullyPaid ? 'PAYÉ' : 'PARTIEL' }}
                            </div>
                            @if(!$isFullyPaid)
                                <div style="font-size: 6px; margin-top: 2px;">
                                    Reste: {{ number_format($remaining, 2) }} MAD
                                </div>
                            @endif
                        </div>
                    @endif
                </div>
            </div>

            <div class="signatures">
                <div class="signature-box">
                    <div>Étudiant</div>
                    <div class="signature-line"></div>
                </div>
                <div class="signature-box">
                    <div>Cachet</div>
                    <div class="signature-line"></div>
                </div>
                <div class="signature-box">
                    <div>Administration</div>
                    <div class="signature-line"></div>
                </div>
            </div>

            <div class="footer">
                <p>Reçu d'inscription • {{ $date_generation }}</p>
            </div>
        </div>
    </div>
</body>
</html>