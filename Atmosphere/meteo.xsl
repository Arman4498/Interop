<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="html" encoding="UTF-8"/>
    
    <xsl:template match="/">
        <div class="meteo">
            <h2>Prévisions météorologiques de la journée</h2>
            <xsl:if test="/previsions/@departement or /previsions/@ville">
                <p>
                    <strong>📍 Localisation :</strong>
                    <xsl:if test="/previsions/@ville">
                        <xsl:value-of select="/previsions/@ville"/>
                    </xsl:if>
                    <xsl:if test="/previsions/@departement">
                        <xsl:if test="/previsions/@ville">, </xsl:if>
                        <xsl:value-of select="/previsions/@departement"/>
                    </xsl:if>
                    <xsl:if test="/previsions/@pays">
                        <xsl:text> (</xsl:text>
                        <xsl:value-of select="/previsions/@pays"/>
                        <xsl:text>)</xsl:text>
                    </xsl:if>
                </p>
            </xsl:if>
            
            <!-- Matin (6h-12h) -->
            <xsl:call-template name="periode-temp">
                <xsl:with-param name="nom" select="'Matin'"/>
                <xsl:with-param name="heure-min" select="6"/>
                <xsl:with-param name="heure-max" select="11"/>
            </xsl:call-template>
            
            <!-- Midi (12h-15h) -->
            <xsl:call-template name="periode-temp">
                <xsl:with-param name="nom" select="'Midi'"/>
                <xsl:with-param name="heure-min" select="11"/>
                <xsl:with-param name="heure-max" select="13"/>
            </xsl:call-template>
            
            <!-- Soir (15h-21h) -->
            <xsl:call-template name="periode-temp">
                <xsl:with-param name="nom" select="'Soir'"/>
                <xsl:with-param name="heure-min" select="17"/>
                <xsl:with-param name="heure-max" select="23"/>
            </xsl:call-template>
        </div>
    </xsl:template>
    
    <xsl:template name="periode-temp">
        <xsl:param name="nom"/>
        <xsl:param name="heure-min"/>
        <xsl:param name="heure-max"/>
        
        <xsl:variable name="echeances" 
                      select="/previsions/echeance[@hour &gt;= $heure-min and @hour &lt; $heure-max]"/>
        
        <xsl:variable name="temps" select="$echeances/temperature/level[@val='2m']"/>
        
        <xsl:if test="count($temps) &gt; 0">
            <xsl:variable name="moyenne-kelvin" select="sum($temps) div count($temps)"/>
            <xsl:variable name="temp-celsius" select="number($moyenne-kelvin) - number('273.15')"/>
            
            <!-- Humidité moyenne -->
            <xsl:variable name="humidites" select="$echeances/humidite/level"/>
            <xsl:variable name="humidite-moyenne" select="sum($humidites) div count($humidites)"/>
            
            <!-- Vent moyen -->
            <xsl:variable name="vents-moyens" select="$echeances/vent_moyen/level"/>
            <xsl:variable name="vent-moyen" select="sum($vents-moyens) div count($vents-moyens)"/>
            
            <!-- Vent rafales -->
            <xsl:variable name="vents-rafales" select="$echeances/vent_rafales/level"/>
            <xsl:variable name="vent-rafale" select="sum($vents-rafales) div count($vents-rafales)"/>
            
            <!-- Pluie totale -->
            <xsl:variable name="pluies" select="$echeances/pluie"/>
            <xsl:variable name="pluie-totale" select="sum($pluies)"/>
            
            <!-- Risque de neige -->
            <xsl:variable name="risques-neige" select="$echeances/risque_neige[number(.) &gt; 0]"/>
            <xsl:variable name="a-risque-neige" select="count($risques-neige) &gt; 0"/>
            
            <div class="periode">
                <strong><xsl:value-of select="$nom"/> (<xsl:value-of select="$heure-min"/>h-<xsl:value-of select="$heure-max"/>h) :</strong>
                <div style="margin-left: 20px; margin-top: 5px;">
                    <!-- Température -->
                    <div>
                <xsl:choose>
                    <xsl:when test="$temp-celsius &lt; 5">
                        <span>❄️ Froid (<xsl:value-of select="format-number($temp-celsius, '0.0')"/>°C)</span>
                    </xsl:when>
                    <xsl:when test="$temp-celsius &lt; 10">
                        <span>🧊 Frais (<xsl:value-of select="format-number($temp-celsius, '0.0')"/>°C)</span>
                    </xsl:when>
                    <xsl:otherwise>
                        <span>🌡️ <xsl:value-of select="format-number($temp-celsius, '0.0')"/>°C</span>
                    </xsl:otherwise>
                </xsl:choose>
                    </div>
                    
                    <!-- Humidité -->
                    <div>
                        <span>💧 Humidité : <xsl:value-of select="format-number($humidite-moyenne, '0')"/>%</span>
                    </div>
                    
                    <!-- Vent -->
                    <div>
                        <span>💨 Vent : <xsl:value-of select="format-number($vent-moyen, '0.0')"/> km/h</span>
                        <xsl:if test="$vent-rafale &gt; $vent-moyen">
                            <span> (rafales jusqu'à <xsl:value-of select="format-number($vent-rafale, '0.0')"/> km/h)</span>
                        </xsl:if>
                    </div>
                    
                    <!-- Pluie -->
                    <div>
                        <xsl:choose>
                            <xsl:when test="$pluie-totale &gt; 0">
                                <span>🌧️ Pluie prévue : <xsl:value-of select="format-number($pluie-totale, '0.0')"/> mm</span>
                            </xsl:when>
                            <xsl:otherwise>
                                <span>☀️ Pas de pluie</span>
                            </xsl:otherwise>
                        </xsl:choose>
                    </div>
                    
                    <!-- Neige -->
                    <div>
                        <xsl:choose>
                            <xsl:when test="$a-risque-neige or ($temp-celsius &lt; 2 and $pluie-totale &gt; 0)">
                                <span>❄️ Neige possible</span>
                            </xsl:when>
                            <xsl:otherwise>
                                <span>☀️ Pas de neige</span>
                            </xsl:otherwise>
                        </xsl:choose>
                    </div>
                </div>
            </div>
        </xsl:if>
    </xsl:template>
    
</xsl:stylesheet>

