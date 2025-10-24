import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';

export interface EmailNotification {
  to: string;
  subject: string;
  message: string;
  contentType: 'question' | 'answer' | 'reply';
  contentTitle: string | any; // Có thể là JSON TipTap
  hideReason: string;
}

export interface UserBanNotification {
  to: string;
  userName: string;
  reason: string;
  banDate: Date;
  banExpiresAt?: Date; // null = permanent ban
}

export interface UserUnbanNotification {
  to: string;
  userName: string;
  unbanDate: Date;
}

@Injectable()
export class EmailService {
  /**
   * Gửi email thông báo nội dung bị ẩn
   */
  async sendContentHiddenNotification(
    notification: EmailNotification,
  ): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"ChatOverflow" <${process.env.EMAIL_USER}>`,
      to: notification.to,
      subject: notification.subject,
      html: this.generateEmailTemplate(notification),
    });
  }

  /**
   * Chuyển đổi TipTap/ProseMirror content thành text thuần
   */
  private extractHtmlFromContent(content: any): string {
    if (!content) return '';

    if (typeof content === 'string') return `<p>${content}</p>`;

    if (Array.isArray(content)) {
      return content
        .map((child) => this.extractHtmlFromContent(child))
        .join('');
    }

    switch (content.type) {
      case 'text':
        let text = content.text || '';
        if (Array.isArray(content.marks)) {
          for (const mark of content.marks) {
            if (mark.type === 'bold') text = `<strong>${text}</strong>`;
            if (mark.type === 'italic') text = `<em>${text}</em>`;
            if (mark.type === 'code') text = `<code>${text}</code>`;
            // có thể mở rộng các mark khác nếu cần
          }
        }
        return text;

      case 'paragraph':
        return `<p>${this.extractHtmlFromContent(content.content)}</p>`;

      case 'heading':
        const level = content.attrs?.level || 1;
        return `<h${level}>${this.extractHtmlFromContent(content.content)}</h${level}>`;

      case 'blockquote':
        return `<blockquote>${this.extractHtmlFromContent(content.content)}</blockquote>`;

      case 'orderedList':
        return `<ol>${this.extractHtmlFromContent(content.content)}</ol>`;

      case 'bulletList':
        return `<ul>${this.extractHtmlFromContent(content.content)}</ul>`;

      case 'listItem':
        return `<li>${this.extractHtmlFromContent(content.content)}</li>`;

      case 'codeBlock':
        return `<pre><code>${this.extractHtmlFromContent(content.content)}</code></pre>`;

      case 'hardBreak':
        return '<br/>';

      case 'image':
        if (content.attrs?.src) {
          // Thêm style để ảnh nhỏ hơn, giữ tỉ lệ
          return `<img src="${content.attrs.src}" alt="${content.attrs?.alt || ''}" style="max-width:100%; height:auto;" />`;
        }
        return '';

      case 'link':
        return `<a href="${content.attrs?.href}" target="_blank">${content.text || ''}</a>`;

      default:
        return content.content
          ? this.extractHtmlFromContent(content.content)
          : '';
    }
  }

  /**
   * Parse contentTitle thành text
   */
  private parseContentTitleToHtml(contentTitle: string | any): string {
    if (!contentTitle) return '';
    if (typeof contentTitle === 'string') {
      const trimmed = contentTitle.trim();
      const cleanStr = trimmed.endsWith('...')
        ? trimmed.slice(0, -3).trim()
        : trimmed;
      if (cleanStr.startsWith('{') || cleanStr.startsWith('[')) {
        try {
          const parsed = JSON.parse(cleanStr);
          return this.extractHtmlFromContent(parsed) || cleanStr;
        } catch {
          return cleanStr;
        }
      }
      return cleanStr;
    }
    return this.extractHtmlFromContent(contentTitle) || '';
  }
  /**
   * Tạo email template
   */
  private generateEmailTemplate(notification: EmailNotification): string {
    const contentHtml = this.parseContentTitleToHtml(notification.contentTitle);

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Content Hidden Notification</h2>
        
        <p>Dear User,</p>
        <p>Your ${notification.contentType} has been hidden by our moderation team.</p>
        
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="margin: 0 0 8px 0; color: #991b1b;">Content Details:</h3>
          <p><strong>Content:</strong></p>
          <div style="padding-left:8px;">${contentHtml}</div>
          <p><strong>Reason:</strong> ${notification.hideReason}</p>
          <p><strong>Type:</strong> ${notification.contentType}</p>
        </div>
        
        <p>${notification.message}</p>
        
        <p>If you have any questions about this action, please contact our support team.</p>
        
        <p>Best regards,<br>ChatOverflow Moderation Team</p>
      </div>
    `;
  }

  /**
   * Tạo transporter để tái sử dụng
   */
  private createTransporter() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  /**
   * Gửi email thông báo user bị ban
   */
  async sendUserBannedNotification(
    notification: UserBanNotification,
  ): Promise<void> {
    const transporter = this.createTransporter();

    await transporter.sendMail({
      from: `"ChatOverflow" <${process.env.EMAIL_USER}>`,
      to: notification.to,
      subject: '🚫 Account Banned - ChatOverflow',
      html: this.generateUserBanEmailTemplate(notification),
    });
  }

  /**
   * Gửi email thông báo user được unban
   */
  async sendUserUnbannedNotification(
    notification: UserUnbanNotification,
  ): Promise<void> {
    const transporter = this.createTransporter();

    await transporter.sendMail({
      from: `"ChatOverflow" <${process.env.EMAIL_USER}>`,
      to: notification.to,
      subject: '✅ Account Restored - ChatOverflow',
      html: this.generateUserUnbanEmailTemplate(notification),
    });
  }

  /**
   * Tạo template email thông báo ban user
   */
  private generateUserBanEmailTemplate(
    notification: UserBanNotification,
  ): string {
    const banDate = new Date(notification.banDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const isPermanent = !notification.banExpiresAt;
    const isTestBan =
      notification.banExpiresAt &&
      new Date(notification.banExpiresAt).getTime() -
        new Date(notification.banDate).getTime() <=
        10000; // 10 seconds or less

    const expiryDate = notification.banExpiresAt
      ? new Date(notification.banExpiresAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: isTestBan ? '2-digit' : undefined, // Include seconds for test bans
        })
      : null;

    let banDurationText;
    if (isPermanent) {
      banDurationText = 'This is a permanent ban';
    } else if (isTestBan) {
      banDurationText = `Your ban will automatically expire on ${expiryDate} (Test ban - expires in seconds)`;
    } else {
      banDurationText = `Your ban will automatically expire on ${expiryDate}`;
    }

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🚫 Account ${isPermanent ? 'Permanently' : isTestBan ? 'Test' : 'Temporarily'} Banned</h1>
        </div>
        
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #374151; margin: 0 0 16px 0;">Dear ${notification.userName},</p>
          
          <p style="font-size: 16px; color: #374151; margin: 0 0 16px 0;">
            We regret to inform you that your ChatOverflow account has been ${isPermanent ? 'permanently' : isTestBan ? 'temporarily (test ban)' : 'temporarily'} banned due to a violation of our community guidelines.
          </p>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <h3 style="margin: 0 0 8px 0; color: #991b1b; font-size: 18px;">Ban Details:</h3>
            <p style="margin: 0 0 8px 0; color: #374151;"><strong>Date:</strong> ${banDate}</p>
            <p style="margin: 0 0 8px 0; color: #374151;"><strong>Duration:</strong> ${isPermanent ? 'Permanent' : isTestBan ? 'Test (5 seconds)' : 'Temporary'}</p>
            ${!isPermanent ? `<p style="margin: 0 0 8px 0; color: #374151;"><strong>Expires:</strong> ${expiryDate}</p>` : ''}
            <p style="margin: 0 0 8px 0; color: #374151;"><strong>Reason:</strong></p>
            <div style="background-color: #ffffff; padding: 12px; border-radius: 4px; margin-top: 8px;">
              <p style="margin: 0; color: #dc2626; font-weight: 500;">${notification.reason}</p>
            </div>
          </div>
          
          <div style="background-color: ${isPermanent ? '#fef2f2' : '#eff6ff'}; border-left: 4px solid ${isPermanent ? '#dc2626' : '#3b82f6'}; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <h4 style="margin: 0 0 8px 0; color: ${isPermanent ? '#991b1b' : '#1e40af'};">
              ${isPermanent ? 'Permanent Ban Information:' : 'Temporary Ban Information:'}
            </h4>
            <p style="margin: 0; color: #374151;">
              ${banDurationText}
              ${!isPermanent ? ' You will be able to access your account again after this date.' : ''}
            </p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 8px 0; color: #374151;">What this means:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
              <li>You cannot access your ChatOverflow account</li>
              <li>You cannot post questions, answers, or comments</li>
              <li>Your profile and content may be hidden from other users</li>
              ${!isPermanent ? '<li>Your access will be automatically restored when the ban expires</li>' : ''}
            </ul>
          </div>
          
          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <h4 style="margin: 0 0 8px 0; color: #1e40af;">Appeal Process:</h4>
            <p style="margin: 0; color: #374151;">
              If you believe this ban was issued in error, you may appeal by contacting our support team at 
              <a href="mailto:support@chatoverflow.com" style="color: #3b82f6; text-decoration: none;">support@chatoverflow.com</a>
              with your appeal request and any relevant information.
            </p>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin: 20px 0 0 0;">
            We appreciate your understanding and encourage you to review our 
            <a href="#" style="color: #3b82f6; text-decoration: none;">Community Guidelines</a> 
            for future reference.
          </p>
          
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #374151;">Best regards,<br><strong>ChatOverflow Moderation Team</strong></p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Tạo template email thông báo unban user
   */
  private generateUserUnbanEmailTemplate(
    notification: UserUnbanNotification,
  ): string {
    const unbanDate = new Date(notification.unbanDate).toLocaleDateString(
      'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    );

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">✅ Account Restored</h1>
        </div>
        
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #374151; margin: 0 0 16px 0;">Dear ${notification.userName},</p>
          
          <p style="font-size: 16px; color: #374151; margin: 0 0 16px 0;">
            Great news! Your ChatOverflow account has been restored and you can now access all platform features again.
          </p>
          
          <div style="background-color: #f0fdf4; border-left: 4px solid #059669; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <h3 style="margin: 0 0 8px 0; color: #047857; font-size: 18px;">Restoration Details:</h3>
            <p style="margin: 0; color: #374151;"><strong>Date:</strong> ${unbanDate}</p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 8px 0; color: #374151;">What you can do now:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
              <li>✅ Access your ChatOverflow account</li>
              <li>✅ Post questions and provide answers</li>
              <li>✅ Comment and engage with the community</li>
              <li>✅ Update your profile and settings</li>
            </ul>
          </div>
          
          <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <h4 style="margin: 0 0 8px 0; color: #d97706;">Moving Forward:</h4>
            <p style="margin: 0; color: #374151;">
              Please remember to follow our 
              <a href="#" style="color: #3b82f6; text-decoration: none;">Community Guidelines</a> 
              to ensure a positive experience for all users. We trust that you will continue to contribute positively to our community.
            </p>
          </div>
          
          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" 
               style="display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
              Access Your Account
            </a>
          </div>
          
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #374151;">Welcome back!<br><strong>ChatOverflow Team</strong></p>
          </div>
        </div>
      </div>
    `;
  }
}
