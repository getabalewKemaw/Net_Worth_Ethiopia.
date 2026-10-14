import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Share,
  ActivityIndicator,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useBusinessHealthStore } from '@/store/business-health-store';
import type { CreateShareTokenParams } from '@/types/health';

interface ShareDossierModalProps {
  businessId: string;
  businessName: string;
}

const PRESET_FUNDERS = [
  'Commercial Bank of Ethiopia (CBE)',
  'Awash Bank',
  'Dashen Bank',
  'Enat Bank',
  'Telebirr Sanduq / Digital Credit',
  'Private Investor / Auditor',
];

const PURPOSES = [
  { id: 'bank_loan', label: 'Commercial Bank Loan' },
  { id: 'working_capital', label: 'Working Capital Credit' },
  { id: 'grant', label: 'MSME Fund / Grant' },
  { id: 'investor_audit', label: 'Investor Audit' },
] as const;

const VALIDITY_OPTIONS = [
  { days: 15, label: '15 Days' },
  { days: 30, label: '30 Days' },
  { days: 60, label: '60 Days' },
  { days: 90, label: '90 Days' },
];

export function ShareDossierModal({ businessId, businessName }: ShareDossierModalProps) {
  const isVisible = useBusinessHealthStore((s) => s.shareModalVisible);
  const closeModal = useBusinessHealthStore((s) => s.closeShareModal);
  const isPending = useBusinessHealthStore((s) => s.isSharingPending);
  const activeToken = useBusinessHealthStore((s) => s.activeShareResult);
  const shareError = useBusinessHealthStore((s) => s.shareError);
  const generateShareLink = useBusinessHealthStore((s) => s.generateShareLink);
  const revokeActiveToken = useBusinessHealthStore((s) => s.revokeActiveToken);

  const [selectedPurpose, setSelectedPurpose] = useState<
    'bank_loan' | 'working_capital' | 'grant' | 'investor_audit'
  >('bank_loan');
  const [funderName, setFunderName] = useState<string>('Commercial Bank of Ethiopia (CBE)');
  const [validityDays, setValidityDays] = useState<number>(30);
  const [funderNote, setFunderNote] = useState<string>('');
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);

  const handleGenerate = async () => {
    try {
      const payload: CreateShareTokenParams = {
        businessId,
        purpose: selectedPurpose,
        funderName: funderName.trim() || undefined,
        funderNote: funderNote.trim() || undefined,
        validityDays,
      };
      await generateShareLink(payload);
    } catch {
      // handled in store
    }
  };

  const handleNativeShare = async () => {
    if (!activeToken?.shareUrl) return;
    try {
      await Share.share({
        title: `Financial Dossier: ${businessName}`,
        message: `Official Business Financial Dossier for ${businessName}:\n${activeToken.shareUrl}\n\nRead-only verified financial snapshot for loan evaluation.`,
        url: activeToken.shareUrl,
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  const handleCopyLink = () => {
    if (!activeToken?.shareUrl) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(activeToken.shareUrl);
      }
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 3000);
    } catch {
      handleNativeShare();
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={closeModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View>
              <ThemedText style={styles.modalTitle}>Share Loan Dossier</ThemedText>
              <ThemedText style={styles.modalSubtitle}>
                {businessName} · Bank & Funder Portal
              </ThemedText>
            </View>
            <TouchableOpacity
              onPress={closeModal}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <ThemedText style={styles.closeBtnText}>✕</ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {activeToken ? (
              /* Success / Active Share Token View */
              <View style={styles.successSection}>
                <View style={styles.shieldBadge}>
                  <ThemedText style={styles.shieldIcon}>🛡️</ThemedText>
                </View>

                <ThemedText style={styles.successTitle}>
                  Bank-Certified Link Generated
                </ThemedText>
                <ThemedText style={styles.successDesc}>
                  A read-only, tamper-proof snapshot URL has been minted for{' '}
                  <ThemedText style={styles.boldText}>
                    {activeToken.funderName || 'Loan Committee'}
                  </ThemedText>
                  .
                </ThemedText>

                {/* Token Box */}
                <View style={styles.tokenBox}>
                  <ThemedText style={styles.tokenLabel}>VERIFICATION LINK</ThemedText>
                  <ThemedText style={styles.tokenUrl} numberOfLines={2}>
                    {activeToken.shareUrl}
                  </ThemedText>
                  {activeToken.expiresAt && (
                    <ThemedText style={styles.expiresText}>
                      Valid until:{' '}
                      {new Date(activeToken.expiresAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </ThemedText>
                  )}
                </View>

                {/* Share Actions */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.sharePrimaryBtn}
                    onPress={handleNativeShare}
                    activeOpacity={0.8}
                  >
                    <ThemedText style={styles.sharePrimaryBtnText}>
                      📤 Share with Bank
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.copySecondaryBtn}
                    onPress={handleCopyLink}
                    activeOpacity={0.8}
                  >
                    <ThemedText style={styles.copySecondaryBtnText}>
                      {copiedNotice ? '✓ Copied!' : '📋 Copy Link'}
                    </ThemedText>
                  </TouchableOpacity>
                </View>

                {/* Revoke Token Action */}
                <TouchableOpacity
                  style={styles.revokeBtn}
                  onPress={revokeActiveToken}
                  activeOpacity={0.7}
                >
                  <ThemedText style={styles.revokeBtnText}>
                    Revoke & Expire Link Now
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              /* Token Generation Form */
              <View style={styles.formSection}>
                <ThemedText style={styles.infoBanner}>
                  Generate a tamper-proof verification URL for loan officers to audit your
                  cash flow, digital payment footprint, and debt repayment history.
                </ThemedText>

                {/* Purpose Picker */}
                <View style={styles.fieldGroup}>
                  <ThemedText style={styles.fieldLabel}>Funding Purpose</ThemedText>
                  <View style={styles.purposeGrid}>
                    {PURPOSES.map((p) => {
                      const isSelected = selectedPurpose === p.id;
                      return (
                        <TouchableOpacity
                          key={p.id}
                          style={[
                            styles.purposeChip,
                            isSelected && styles.purposeChipSelected,
                          ]}
                          onPress={() => setSelectedPurpose(p.id)}
                          activeOpacity={0.7}
                        >
                          <ThemedText
                            style={[
                              styles.purposeChipText,
                              isSelected && styles.purposeChipTextSelected,
                            ]}
                          >
                            {p.label}
                          </ThemedText>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Funder Preset Suggestions */}
                <View style={styles.fieldGroup}>
                  <ThemedText style={styles.fieldLabel}>Recipient Funder / Bank</ThemedText>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.presetsScroll}
                  >
                    {PRESET_FUNDERS.map((name) => (
                      <TouchableOpacity
                        key={name}
                        style={[
                          styles.presetChip,
                          funderName === name && styles.presetChipActive,
                        ]}
                        onPress={() => setFunderName(name)}
                      >
                        <ThemedText
                          style={[
                            styles.presetChipText,
                            funderName === name && styles.presetChipTextActive,
                          ]}
                        >
                          {name}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <TextInput
                    style={styles.textInput}
                    value={funderName}
                    onChangeText={setFunderName}
                    placeholder="e.g. Dashen Bank Bole Branch"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                {/* Validity Period */}
                <View style={styles.fieldGroup}>
                  <ThemedText style={styles.fieldLabel}>Link Validity Duration</ThemedText>
                  <View style={styles.validityRow}>
                    {VALIDITY_OPTIONS.map((v) => {
                      const isSelected = validityDays === v.days;
                      return (
                        <TouchableOpacity
                          key={v.days}
                          style={[
                            styles.validityChip,
                            isSelected && styles.validityChipSelected,
                          ]}
                          onPress={() => setValidityDays(v.days)}
                        >
                          <ThemedText
                            style={[
                              styles.validityChipText,
                              isSelected && styles.validityChipTextSelected,
                            ]}
                          >
                            {v.label}
                          </ThemedText>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Optional Note */}
                <View style={styles.fieldGroup}>
                  <ThemedText style={styles.fieldLabel}>
                    Cover Note for Funder (Optional)
                  </ThemedText>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={funderNote}
                    onChangeText={setFunderNote}
                    placeholder="e.g. In support of Q4 Working Capital facility for inventory purchase."
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {shareError && (
                  <View style={styles.errorBox}>
                    <ThemedText style={styles.errorText}>{shareError}</ThemedText>
                  </View>
                )}

                {/* Generate Button */}
                <TouchableOpacity
                  style={[styles.generateBtn, isPending && styles.btnDisabled]}
                  onPress={handleGenerate}
                  disabled={isPending}
                  activeOpacity={0.8}
                >
                  {isPending ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <ThemedText style={styles.generateBtnText}>
                      🔒 Generate Bank-Certified Dossier
                    </ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  formSection: {
    width: '100%',
  },
  infoBanner: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  purposeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  purposeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  purposeChipSelected: {
    borderColor: '#065F46',
    backgroundColor: '#ECFDF5',
  },
  purposeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  purposeChipTextSelected: {
    color: '#065F46',
    fontWeight: '700',
  },
  presetsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 8,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  presetChipActive: {
    backgroundColor: '#065F46',
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    marginTop: 4,
  },
  textArea: {
    height: 72,
    textAlignVertical: 'top',
  },
  validityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  validityChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  validityChipSelected: {
    borderColor: '#065F46',
    backgroundColor: '#ECFDF5',
  },
  validityChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  validityChipTextSelected: {
    color: '#065F46',
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  generateBtn: {
    backgroundColor: '#065F46',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#065F46',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  generateBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Success Section Styles
  successSection: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  shieldBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  shieldIcon: {
    fontSize: 32,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  successDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  boldText: {
    color: '#0F172A',
    fontWeight: '700',
  },
  tokenBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  tokenLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  tokenUrl: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#0284C7',
    marginBottom: 8,
  },
  expiresText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginBottom: 16,
  },
  sharePrimaryBtn: {
    flex: 1,
    backgroundColor: '#065F46',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sharePrimaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  copySecondaryBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  copySecondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  revokeBtn: {
    paddingVertical: 8,
  },
  revokeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
});
